import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { CreateRediDto } from './dto/create-redi.dto';
import { UpdateRediDto } from './dto/update-redi.dto';

@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @MessagePattern('createRedi')
  create(@Payload() createRediDto: CreateRediDto) {
    return this.redisService.create(createRediDto);
  }

  @MessagePattern('findAllRedis')
  findAll() {
    return this.redisService.findAll();
  }

  @MessagePattern('findOneRedi')
  findOne(@Payload() id: number) {
    return this.redisService.findOne(id);
  }

  @MessagePattern('updateRedi')
  update(@Payload() updateRediDto: UpdateRediDto) {
    return this.redisService.update(updateRediDto.id, updateRediDto);
  }

  @MessagePattern('removeRedi')
  remove(@Payload() id: number) {
    return this.redisService.remove(id);
  }
}
