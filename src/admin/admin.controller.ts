import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TestCreatePostDTO } from './admin.dto';
import { AdminService } from './admin.service';
import { PostRepository } from 'src/post/post.repository';
import { AdminGuard } from './guard/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly postRepository: PostRepository,
  ) {}

  @UseGuards(AdminGuard)
  @Post('post/create')
  async testCreatePost(@Body() testCreatePostDTO: TestCreatePostDTO) {
    const data = await this.adminService.testCreatePost(testCreatePostDTO);
    return { message: 'test post created', data };
  }

  @UseGuards(AdminGuard)
  @Post('post/all')
  async findAllPost() {
    const data = await this.postRepository.findAllGroupByUserId();
    return { message: 'All posts find successfully', data };
  }

  @UseGuards(AdminGuard)
  @Post('user/all')
  async findAllUser() {
    const data = await this.adminService.findAllUser();

    return { message: 'All users find successfully', data };
  }
}
