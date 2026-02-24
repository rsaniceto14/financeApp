import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(body: CreateUserDto): Promise<{
        id: string;
        email: string;
        organizationId: string;
    }>;
}
