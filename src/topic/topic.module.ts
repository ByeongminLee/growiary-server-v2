import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TopicRepository } from './topic.repository';

@Module({
  controllers: [TopicController],
  providers: [TopicService, TopicRepository],
})
export class TopicModule {}
