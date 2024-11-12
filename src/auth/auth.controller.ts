import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerData } from 'src/interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('register')
    async register(@Body() registrationData: registerData) {
      return this.authService.register(registrationData.email, registrationData.password);
    }
    @Post('login')
    async login(@Body() body: { email: string; password: string; device: string }) {
      const { email, password, device } = body;
      return this.authService.login(email, password, device);
    }
  
    @Post('logout')
    async logout(@Body('token') token: string) {
      return this.authService.logout(token);
    }
}
