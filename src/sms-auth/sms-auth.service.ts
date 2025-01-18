import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsAuthService {
    private codes = new Map<string, { code: string; expiresAt: Date }>();

    // Генерация 6-значного кода
    generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Сохранение кода для номера телефона
    async saveCode(phoneNumber: string): Promise<{ code: string; expiresAt: Date }> {
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Код истекает через 5 минут

        // Сохраняем код в памяти
        this.codes.set(phoneNumber, { code, expiresAt });
        return { code, expiresAt };
    }

    // Проверка кода
    async verifyCode(phoneNumber: string, inputCode: string): Promise<boolean> {
        const record = this.codes.get(phoneNumber);
        if (!record) return false; // Код не найден

        const { code, expiresAt } = record;

        if (new Date() > expiresAt) {
            this.codes.delete(phoneNumber); // Удаляем истекший код
            return false;
        }

        const isValid = code === inputCode;

        if (isValid) {
            this.codes.delete(phoneNumber); // Удаляем код после успешной валидации
        }

        return isValid;
    }

    // Симулируем отправку SMS
    async sendCode(phoneNumber: string): Promise<string> {
        const { code } = await this.saveCode(phoneNumber);
        console.log(`[Имитация SMS] Код для ${phoneNumber}: ${code}`);
        return code;
    }
}

