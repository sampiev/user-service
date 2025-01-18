import { PrismaClientExceptionFilter } from './prisma-client-exception.filter'; // Путь к вашему фильтру
import { Prisma } from '@prisma/client';
import { ArgumentsHost, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('PrismaClientExceptionFilter', () => {
    let filter: PrismaClientExceptionFilter;
    let mockArgumentsHost: MockProxy<ArgumentsHost>;
    let mockResponse: any;

    beforeEach(() => {
        filter = new PrismaClientExceptionFilter();

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockArgumentsHost = mock<ArgumentsHost>();
        mockArgumentsHost.switchToHttp.mockReturnValue({
            getResponse: () => mockResponse,
            getRequest: () => ({ url: '/test-path' }),
        } as any);
    });

    it('should catch P2000 (Value too long for field) and throw BadRequestException', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Value too long for field', { code: 'P2000', clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(new BadRequestException('Value too long for field').getResponse());
    });

    it('should catch P2002 (Unique constraint violation) and throw ConflictException', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', meta: { target: ['email'], }, clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith(new ConflictException('Unique constraint failed on the field: email').getResponse());
    });

    it('should catch P2002 (Unique constraint violation) with meta.value', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', meta: { target: ['email'], value: 'test@example.com' }, clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith(new ConflictException('Unique constraint failed on the field: email with value: test@example.com').getResponse());
    });

    it('should catch P2025 (Record not found) and throw NotFoundException', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Record not found.', { code: 'P2025', clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith(new NotFoundException('Record not found').getResponse());
    });
    it('should catch P2003 (Foreign key constraint failed) and throw BadRequestException', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', { code: 'P2003', clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(new BadRequestException('Foreign key constraint failed').getResponse());
    });
    it('should catch P2011 (Null constraint violation) and throw BadRequestException', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Null constraint violation', { code: 'P2011', clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(new BadRequestException('Invalid data format').getResponse()); // Сообщение из фильтра
    });
    it('should catch P2012 (Missing a required value) and throw BadRequestException', () => {
        const exception = new Prisma.PrismaClientKnownRequestError('Missing a required value', { code: 'P2012', clientVersion: '6.2.1' });
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(new BadRequestException('Missing required value').getResponse());
    })
    // it('should catch other Prisma errors and throw InternalServerErrorException', () => {
    //     const exception = new Prisma.PrismaClientKnownRequestError('Some other error', { code: 'P9999', clientVersion: '6.2.1' });
    //     filter.catch(exception, mockArgumentsHost);
    //     expect(mockResponse.status).toHaveBeenCalledWith(500);
    //     expect(mockResponse.json).toHaveBeenCalledWith(new InternalServerErrorException('Unexpected database error').getResponse());
    // });
});
