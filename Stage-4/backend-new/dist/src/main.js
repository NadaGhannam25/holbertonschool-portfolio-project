"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cron_1 = require("./services/cron");
function validateEnvironment() {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required. Please add it to your .env file.');
    }
}
async function bootstrap() {
    validateEnvironment();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    (0, cron_1.startCronJobs)();
    console.log(`Server running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map