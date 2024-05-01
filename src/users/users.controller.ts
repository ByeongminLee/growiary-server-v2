import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('count')
  async countUsers() {
    const count = await this.usersService.allUserCount();

    return { message: 'Users count successfully', count };
  }
}
