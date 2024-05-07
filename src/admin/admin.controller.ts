import { Body, Controller, Post } from '@nestjs/common';
import { TestCreatePostDTO } from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('post/create')
  async testCreatePost(@Body() testCreatePostDTO: TestCreatePostDTO) {
    const data = await this.adminService.testCreatePost(testCreatePostDTO);
    return { message: 'test post created', data };
  }
}
