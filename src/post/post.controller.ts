import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDTO, UpdatePostDTO } from './post.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPost(@Body() createPostDTO: CreatePostDTO) {
    const data = await this.postService.createPost(createPostDTO);

    return { message: 'Post created successfully', data: Object.values(data) };
  }

  @UseGuards(JwtAuthGuard)
  @Post('all')
  async findAllPost() {
    const data = await this.postService.findUserAllPost();
    if (data.length === 0) {
      return {
        message: 'No posts found',
        data,
      };
    }

    return { message: 'All posts find successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  async findOnePost(@Body('id') id: string) {
    const data = await this.postService.findOnePost(id);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Post not found',
        data: {},
      };
    }

    return { message: 'Post found successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('month')
  async findMonthPost(@Body('month') month: string) {
    const data = await this.postService.findMonthPost(month);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Post not found',
        data: {},
      };
    }

    return { message: 'Post found Month successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('record')
  async myRecordPost(@Body('month') month: string) {
    const data = await this.postService.myRecordPost(month);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Post not found',
        data: {},
      };
    }

    return { message: 'My record found successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async updatePost(@Body() updatePostDTO: UpdatePostDTO) {
    const data = await this.postService.updatePost(updatePostDTO);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Post not found',
        data: [],
      };
    }

    return { message: 'Post updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('weekly')
  async weeklyPost() {
    const data = await this.postService.weeklyPost();

    return { message: 'Post weekly successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('continue-range')
  async continueRangePost() {
    const data = await this.postService.continueRangePost();

    return { message: 'Post continue range successfully', data };
  }
}
