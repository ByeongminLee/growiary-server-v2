import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTopicDTO, UpdateTopicDTO } from './topic.dto';
import { TopicService } from './topic.service';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('all')
  async findAllTopic() {
    const data = await this.topicService.findAllTopic();
    if (data.length === 0) {
      return {
        message: 'No topics found',
        data,
      };
    }

    return {
      message: 'All topics find successfully',
      data,
    };
  }

  @Post('find')
  async findOneTopic(@Body('id') id: number) {
    const data = await this.topicService.findOneTopic(id);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Topic not found',
        data: {},
      };
    }

    return {
      message: 'Topic found successfully',
      data,
    };
  }

  @Post('create')
  async createTopic(@Body() createTopicDTO: CreateTopicDTO) {
    const result = await this.topicService.createTopic(createTopicDTO);

    return {
      message: 'Topic created successfully',
      result,
    };
  }

  @Post('update')
  async updateTopic(@Body() updateTopicDTO: UpdateTopicDTO) {
    const data = await this.topicService.updateTopic(updateTopicDTO);

    if (data === 'NOT_FOUND') {
      return {
        message: 'Topic not found',
        data: {},
      };
    }

    return {
      message: 'Topic updated successfully',
      data,
    };
  }
}
