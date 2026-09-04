import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许本地各前端应用（vue/react/next 等不同端口）跨域访问
  app.enableCors({
    origin: true, // 开发阶段放开；生产环境应改为域名白名单
  });

  // 监听 0.0.0.0：云平台（Render / Vercel / 容器）要求对外网卡监听，
  // 只监听默认的 localhost 会导致外网访问不到（部署后打不开的根因之一）
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
await bootstrap();