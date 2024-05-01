import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    // @Inject(REQUEST) private readonly request: { user: UserDTO },
  ) {}

  async allUserCount() {
    return await this.userRepository.allUserCount();
  }
}
