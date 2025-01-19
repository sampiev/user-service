// import { Injectable, BadRequestException } from '@nestjs/common';
// import { SmsAuthService } from '../sms-auth/sms-auth.service';
// import { UsersService } from '../users/users.service';
// import { CompletePhoneDto } from './dto/complete-phone.dto';  // DTO для начала регистрации (номер телефона)
// import { VerifySmsDto } from './dto/verify-sms.dto';  // DTO для верификации телефона (ввод кода)
// import { CompleteRegistrationDto } from './dto/complete-registration.dto';  // DTO для завершения регистрации (имя, фамилия, email)
// import { User } from '@prisma/client';  // Типизация для пользователя


// @Injectable()
// export class AuthService {

//     constructor(
//         private readonly usersService: UsersService,
//         private readonly smsAuthService: SmsAuthService,
//     ) { }


//     async startRegistration(completePhoneDto: CompletePhoneDto): Promise<void> {
//         const { phone } = completePhoneDto;
      
//         // Проверяем, существует ли уже пользователь с таким номером
//         const existingUser = await this.usersService.getUserByPhone(phone);
//         if (existingUser) {
//           // Если такой пользователь уже существует, просто отправляем код для авторизации
//           await this.smsAuthService.sendVerificationCode(phone);
//           return;
//         }
      
//         // Если пользователь новый, создаем его с начальным статусом
//         await this.usersService.createUser({ phone, regStatus: 'started' });
      
//         // Отправляем SMS с кодом подтверждения
//         await this.smsAuthService.sendVerificationCode(phone);
//       }



// }



