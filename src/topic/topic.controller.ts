import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTopicDTO, UpdateTopicDTO } from './topic.dto';
import { TopicService } from './topic.service';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('all')
  async findAllTopic() {
    const result = await this.topicService.findAllTopic();
    if (result.length === 0) {
      return {
        message: 'No topics found',
        result,
      };
    }

    return {
      message: 'All topics find successfully',
      result,
    };
  }

  @Post('find')
  async findOneTopic(@Body('id') id: number) {
    const result = await this.topicService.findOneTopic(id);

    if (result === 'NOT_FOUND') {
      return {
        message: 'Topic not found',
        result: {},
      };
    }

    return {
      message: 'Topic found successfully',
      result,
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
    const result = await this.topicService.updateTopic(updateTopicDTO);

    if (result === 'NOT_FOUND') {
      return {
        message: 'Topic not found',
        result: {},
      };
    }

    return {
      message: 'Topic updated successfully',
      result,
    };
  }
}
