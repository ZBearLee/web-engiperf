import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global：全局模块，各业务模块无需重复 import 即可注入 PrismaService
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}