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
            this.logger.error('AuthService: sendVerificationCode - ERROR:', error);
            throw error;
        }
        this.logger.log('AuthService: sendVerificationCode - END'); // Лог в конце функции
    }

    async verifyCode(phone: string, code: string): Promise<boolean> {
        try {
            const storedCode = await this.redisService.getCodeByPhone(phone);
            if (storedCode === code) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.error("Failed to get code from redis", error)
            return false
        }
    }
    private generateCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    private sendSms(phone: string, code: string) {
        // тут отправка смс
        console.log(`Sending SMS to ${phone} with code ${code}`)
    }

}





