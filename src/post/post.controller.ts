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
  @Post('update')
  async updatePost(@Body() updatePostDTO: UpdatePostDTO) {
    const data = await this.postService.updatePost(updatePostDTO);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Post not found',
        data: [],
      };
    }

    return { message: 'Post updated successfully', data: Object.values(data) };
  }

  @UseGuards(JwtAuthGuard)
  @Post('continue-range')
  async continueRangePost() {
    const data = await this.postService.continueRangePost();

    return { message: 'Post continued successfully', data };
  }
}
