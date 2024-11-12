import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService, 
  ) {
    this.jwtService = new JwtService({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      // Verify token and expiration
      const decoded = this.jwtService.verify(token);
      console.log('decoded', decoded);

      // Check if the token exists in the session store
      const session = await this.prisma.session.findUnique({
        where: { token },
      });
      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      // Attach user info (like userId) to the request object
      request.user = { id: decoded.userId };
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'Token is invalid or expired. Please log in again.',
      );
    }
  }
}
