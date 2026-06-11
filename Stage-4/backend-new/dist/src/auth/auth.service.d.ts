import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    register(body: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    login(body: LoginDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}
