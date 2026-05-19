import * as jwt from 'jsonwebtoken';
import { and, eq, gt } from 'drizzle-orm';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { db } from '../db';
import { users } from '../db/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { sendResetPasswordEmail } from '../services/email';

@Injectable()
export class AuthService {
  async register(body: RegisterDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        passwordHash: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    return {
      message: 'User registered successfully',
      user: newUser[0],
    };
  }

  async login(body: LoginDto) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    const user = result[0];

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      },
    );

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async forgotPassword(body: ForgotPasswordDto) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    const user = result[0];

    if (!user) {
      return {
        message:
          'If this email exists, a reset password link has been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt,
      })
      .where(eq(users.id, user.id));

    await sendResetPasswordEmail({
      to: user.email,
      userName: user.name,
      token,
    });

    return {
      message:
        'If this email exists, a reset password link has been sent.',
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    const result = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, body.token),
          gt(users.resetPasswordExpires, new Date()),
        ),
      );

    const user = result[0];

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired reset password token',
      );
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, user.id));

    return {
      message: 'Password reset successfully',
    };
  }
}
