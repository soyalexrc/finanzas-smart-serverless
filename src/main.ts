import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001; // Default to 3000 if PORT is not set
  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all origins (for development)
    credentials: true,
  });
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
