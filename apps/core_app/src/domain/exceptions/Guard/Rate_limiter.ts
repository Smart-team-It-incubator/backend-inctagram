// import {
//     Injectable,
//     CanActivate,
//     ExecutionContext,
//     HttpException,
//     HttpStatus,
//     Inject,
//   } from '@nestjs/common';
//   import { Request } from 'express';
//     import { Cache } from 'cache-manager';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';


//   @Injectable()
//   export class RateLimitGuard implements CanActivate {
//     constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
//     async canActivate(context: ExecutionContext): Promise<boolean> {
//       const request = context.switchToHttp().getRequest<Request>();
//       const ip = request.ip;
//       const endpoint = request.originalUrl;
//       const method = request.method;
      
//       // Уникальный ключ для конкретного IP, метода и эндпоинта
//       const cacheKey = `rate-limit-${ip}-${method}-${endpoint}`;
//       const currentTime = Date.now();
//       const requestTimestamps = (await this.cacheManager.get<number[]>(cacheKey)) || [];
  
//       const recentRequests = requestTimestamps.filter(
//         (timestamp) => currentTime - timestamp < 10000,
//       );
  
//       if (recentRequests.length >= 5) {
//         throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
//       }
  
//       recentRequests.push(currentTime);
//       await this.cacheManager.set(cacheKey, recentRequests);
  
//       return true;
//     }
//   }
  