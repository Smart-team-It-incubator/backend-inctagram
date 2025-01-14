import { CoreAppApiService } from "@core-app-api/core-app-api";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        protected jwtServiceClass: JwtService,
        protected coreAppServiceApi: CoreAppApiService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest();

            // Проверяем наличие и формат заголовка Authorization
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('Authorization header is missing or invalid');
            }
            const [bearer, token] = authHeader.split(' ');
            if (bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException('Invalid authorization format');
            }
            console.log("Попали в JWT Guard, токен есть, готовится проверка")
            // Декодируем токен и проверяем полезную нагрузку
            const decodedPayload = await this.jwtServiceClass.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
            if (!decodedPayload || !decodedPayload.username) {
                throw new UnauthorizedException('Invalid token payload');
            }

            // Получаем пользователя
            const user = await this.coreAppServiceApi.getUserByUsername(decodedPayload.username);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Присваиваем пользователя запросу
            req.user = user;
            return true;
        } catch (e) {
            console.error('JWT Auth Guard error:', e.message);
            throw new UnauthorizedException('Authentication failed');
        }
    }
}
