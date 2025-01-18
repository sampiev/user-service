import { ExceptionFilter, Catch, ArgumentsHost, HttpException, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let httpException: HttpException;
        switch (exception.code) {
            case 'P2002':
                let message = `Unique constraint failed`;
                if (exception.meta) {
                    if (exception.meta.target) {
                        message += ` on the field: ${exception.meta.target}`;
                    }
                    if (exception.meta.value) {
                        message += ` with value: ${exception.meta.value}`
                    }
                }
                httpException = new ConflictException(message);
                break;
            case 'P2025':
                httpException = new NotFoundException(`Record not found`);
                break;
            case 'P2000':
                httpException = new BadRequestException('Value too long for field');
                break;
            case 'P2003':
                httpException = new BadRequestException('Foreign key constraint failed');
                break;
            case 'P2011':
                httpException = new BadRequestException('Invalid data format');
                break;
            case 'P2012':
                httpException = new BadRequestException('Missing required value');
                break;
            default:
                console.error(exception); // Логируем необработанные ошибки
                httpException = new InternalServerErrorException('Unexpected database error');
                break;
        }

        response.status(httpException.getStatus()).json(httpException.getResponse());
    }
}
