import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }


    // Отправка кода пользователю
    async sendVerificationCode(phone: string): Promise<void> {
        this.logger.log('sendVerificationCode: START');
        const code = this.generateCode();

        try {
            await this.redisService.storePhoneAndCode(phone, code);
            this.sendSms(phone, code);
        } catch (error) {
            this.logger.error('sendVerificationCode: ERROR:', error);
            throw new HttpException('Failed to send verification code', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log('sendVerificationCode - DONE'); // Лог в конце функции
    }



    // Генерация кода
    private generateCode(): string {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        this.logger.log(`generateCode: Сгенерирован код: ${code}`);
        return code;
    }



    // Отправка кода пользователю (имитация)
    private sendSms(phone: string, code: string) {
        console.log(`Отправка СМС на ${phone} с кодом ${code}`)
    }



    // Регистрация по номеру телефона
    async registerByPhone(phone: string): Promise<{ accessToken?: string; needsCompletion: true }> {
        try {
            const user = await this.usersService.createUserByPhone({ phone_number: phone });

            const payload = {
                sub: user.user_id,
                phone: user.phone_number,
                role: user.role.name,
            };

            const accessToken = await this.jwtService.signAsync(payload);

            return { accessToken, needsCompletion: true };
        } catch (error) {
            console.error('Ошибка при регистрации пользователя:', error);
            throw error;
        }
    }



    // Авторизация по номеру телефона
    async loginByPhone(phone: string): Promise<{ accessToken: string }> {
        try {
            const user = await this.usersService.findByPhone(phone);

            if (!user) {
                throw new UnauthorizedException('Пользователь с таким номером не найден');
            }

            if (user.statusName !== 'active') {
                throw new UnauthorizedException('Аккаунт не активирован');
            }

            const payload = {
                sub: user.user_id,
                phone: user.phone_number,
                role: user.role.name,
            };

            const accessToken = await this.jwtService.signAsync(payload);

            return { accessToken };
        } catch (error) {
            console.error('Ошибка при авторизации пользователя:', error);
            throw error;
        }
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







}





