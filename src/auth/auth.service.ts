import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('Email is already registered');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
  }
  
  async login(email: string, password: string, device: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const existingSession = await this.prisma.session.findFirst({
      where: { userId: user.id, device },
    });

    if (existingSession) {
      await this.prisma.session.delete({ where: { id: existingSession.id } });
    }

    const token = this.jwtService.sign({ userId: user.id });

    const session = await this.prisma.session.create({
      data: { userId: user.id, token, device },
    });

    return { user: { id: user.id, email: user.email }, token, device: session.device };
  }
 
  async logout(token: string) {
    const session = await this.prisma.session.findUnique({ where: { token } });
    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    await this.prisma.session.delete({ where: { token } });
    return { message: 'Logged out successfully' };
  }
}
