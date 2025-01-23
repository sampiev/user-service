import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt'; // Импортируем JwtService

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async sendVerificationCode(phone: string): Promise<void> {
        this.logger.log('AuthService: sendVerificationCode - START');
        const code = this.generateCode();
        this.logger.log(`AuthService: sendVerificationCode - Generated code: ${code}`);
        try {
            this.logger.log(`AuthService: sendVerificationCode - Calling redisService.storePhoneAndCode`);
            await this.redisService.storePhoneAndCode(phone, code);
            this.logger.log(`AuthService: sendVerificationCode - redisService.storePhoneAndCode completed`);
            this.sendSms(phone, code);
            this.logger.log(`AuthService: sendVerificationCode - sendSms completed`);
        } catch (error) {
            this.logger.error('AuthService: sendVerificationCode - ERROR:', error); // Логируем исходную ошибку
            throw new HttpException('Failed to send verification code', HttpStatus.INTERNAL_SERVER_ERROR); // Выбрасываем HttpException
        }
        this.logger.log('AuthService: sendVerificationCode - END'); // Лог в конце функции
    }

    // Генерация кода
    private generateCode(): string {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        this.logger.log(`AuthService: generateCode - Generated code: ${code}`); // Добавьте этот лог
        return code;
    }

    // Отправка кода пользователю (имитация)
    private sendSms(phone: string, code: string) {
        // тут отправка смс
        console.log(`Sending SMS to ${phone} with code ${code}`)
    }

    // Верификация кода присланного пользователем
    async verifyCode(phone: string, code: string): Promise<boolean> {
        try {
            const storedCode = await this.redisService.getCodeByPhone(phone);

            this.logger.log(`AuthService: verifyCode - phone: "${phone}", type: ${typeof phone}`);
            this.logger.log(`AuthService: verifyCode - storedCode: "${storedCode}", type: ${typeof storedCode}`);
            this.logger.log(`AuthService: verifyCode - code: "${code}", type: ${typeof code}`);

            if (storedCode === null) { // Проверка на null, а не на undefined
                this.logger.warn(`AuthService: verifyCode - Код для телефона ${phone} не найден.`);
                return false;
            }

            // Самое важное: явное преобразование *обоих* значений к строке
            const storedCodeString = String(storedCode);
            const codeString = String(code);

            this.logger.log(`AuthService: verifyCode - storedCodeString: "${storedCodeString}", type: ${typeof storedCodeString}`);
            this.logger.log(`AuthService: verifyCode - codeString: "${codeString}", type: ${typeof codeString}`);

            if (storedCodeString === codeString) {
                this.logger.log(`AuthService: verifyCode - Код для телефона ${phone} успешно верифицирован.`);
                await this.redisService.del(phone);
                return true;
            } else {
                this.logger.warn(`AuthService: verifyCode - Неверный код введен для телефона ${phone}.`);
                return false;
            }
        } catch (error) {
            this.logger.error(`AuthService: verifyCode - Ошибка при получении кода из redis: ${error.message}`, error.stack); // Более подробный лог
            throw new HttpException('Ошибка верификации кода', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async handleUserAfterVerification(phone: string): Promise<{ accessToken?: string; needsCompletion?: boolean }> {
        try {
            let user = await this.usersService.findByPhone(phone);

            if (!user) {
                console.log("Пользователь не найден, создаем нового"); // Добавлено логирование
                user = await this.usersService.create({ phone_number: phone });
                console.log("Созданный пользователь:", user); // Добавлено логирование
            } else {
                console.log("Пользователь найден:", user); // Добавлено логирование
            }

            if (user.status.name === 'incomplete') {
                return { needsCompletion: true };
            }

            const payload = { sub: user.user_id, phone: user.phone_number, status: user.status.name };
            const accessToken = await this.jwtService.signAsync(payload);

            return { accessToken };
        } catch (error) {
            console.error('Ошибка обработки пользователя после верификации:', error);
            throw error;
        }
    }


}





