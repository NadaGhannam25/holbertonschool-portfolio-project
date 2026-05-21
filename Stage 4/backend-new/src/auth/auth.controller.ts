import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import {
  JwtAuthGuard,
  AuthenticatedRequest,
} from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(
    @Body() body: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  resetPassword(
    @Body() body: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  updateProfile(

    @Req()
    req: AuthenticatedRequest,

    @Body()
    body: UpdateProfileDto,

  ) {

    return this.authService.updateProfile(
      req.user!.sub,
      body,
    );
  }

  @Post('logout')
  logout() {
    return {
      message:
        'Logout successful. Please remove the token from client storage.',
    };
  }
}
```
