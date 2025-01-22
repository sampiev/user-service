import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private readonly redisService: RedisService) { }

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

            if (!storedCode) {
                this.logger.warn(`Код для телефона ${phone} не найден.`);
                return false;
            }

            this.logger.log(`AuthService: verifyCode - storedCode: "${storedCode}", type: ${typeof storedCode}`);
            this.logger.log(`AuthService: verifyCode - code: "${code}", type: ${typeof code}`);

            const codeString = String(code); // Явное преобразование code к строке

            if (storedCode === codeString) {
                this.logger.log(`AuthService: verifyCode - Код для телефона ${phone} успешно верифицирован.`); // Лог успешной верификации
                await this.redisService.del(phone);
                return true;
            } else {
                this.logger.warn(`Неверный код введен для телефона ${phone}.`);
                return false;
            }
        } catch (error) {
            this.logger.error("Ошибка при получении кода из redis", error); // Логируем исходную ошибку
            throw new HttpException('Ошибка верификации кода', HttpStatus.INTERNAL_SERVER_ERROR); // Выбрасываем HttpException
        }
    }


}





