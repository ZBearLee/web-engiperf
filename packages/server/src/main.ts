import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许本地各前端应用（vue/react/next 等不同端口）跨域访问
  app.enableCors({
    origin: true, // 开发阶段放开；生产环境应改为域名白名单
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();