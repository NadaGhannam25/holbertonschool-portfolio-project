import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev_secret',
      ) as unknown as JwtPayload;

      (request as any).userId = payload.sub;
      (request as any).userEmail = payload.email;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
