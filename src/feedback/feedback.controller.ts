import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateFeedbackDTO } from './feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createFeedback(@Body() createFeedbackDTO: CreateFeedbackDTO) {
    const data = await this.feedbackService.create(createFeedbackDTO);

    return { message: 'feedback created', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAllFeedback() {
    const data = await this.feedbackService.findAll();

    return { message: 'all feedback', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findAllUserFeedback() {
    const data = await this.feedbackService.findAllUser();

    return { message: 'user feedback', data };
  }
}
