import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema';
import { RegisterDto } from './dto/register.dto';

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
      process.env.JWT_SECRET || 'dev_secret',
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
}
