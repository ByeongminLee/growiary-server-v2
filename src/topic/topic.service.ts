import { Injectable } from '@nestjs/common';
import { CreateTopicDTO, UpdateTopicDTO } from './topic.dto';
import { TopicRepository } from './topic.repository';

@Injectable()
export class TopicService {
  constructor(private readonly topicRepository: TopicRepository) {}

  async findAllTopic() {
    return await this.topicRepository.findAll();
  }

  async findAllAdminTopic() {
    return await this.topicRepository.findAllAdmin();
  }

  async findOneTopic(id: number) {
    return await this.topicRepository.findOne(id);
  }

  async createTopic(createTopicDTO: CreateTopicDTO) {
    const lastIdx = await this.topicRepository.topicLastIndex();

    return await this.topicRepository.create(createTopicDTO, lastIdx);
  }

  async updateTopic(updateTopicDTO: UpdateTopicDTO) {
    return await this.topicRepository.update(updateTopicDTO);
  }
}
