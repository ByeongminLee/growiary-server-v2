import { Injectable } from '@nestjs/common';
import { CreateTopicDTO, UpdateTopicDTO } from './topic.dto';
import { TopicRepository } from './topic.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { PostService } from 'src/post/post.service';
import { PostDTO } from 'src/post/post.dto';

@Injectable()
export class TopicService {
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly postService: PostService,
    private readonly postFilterService: PostFilterService,
  ) {}

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

  /**
   * posts에서 topicId가 사용된 횟수 반환
   * @param posts 전체 post 데이터
   * @param topicId topicId
   * @returns topicId와 사용된 횟수
   */
  async filterTopicId({
    posts,
    topicId,
  }: {
    posts: PostDTO[];
    topicId: string | number;
  }) {
    const topicCount = posts.filter(
      (post) => post.topicId === String(topicId),
    ).length;

    return { topicId, count: topicCount };
  }

  async topTopic(posts: PostDTO[]) {
    const topTopic = await this.postFilterService.filterTopTopic(posts);

    return topTopic;
  }

  async recentTopic(posts: PostDTO[]) {
    const recentTopic = await this.postFilterService.filterRecentTopic(posts);

    return recentTopic;
  }

  async recommendationTopic() {
    const allPosts = await this.postService.findAllPost();
    const userPosts = await this.postService.findUserAllPost();

    // growiary에서 가장 많이 사용된 topic {topicId, count}
    const topTopic = await this.topTopic(allPosts);
    // user가 최근에 사용한 topic {topicId, count}
    const recentTopic = await this.recentTopic(userPosts);

    // 유저가 최근에 사용한 topic과 해당 topic의 전체 유저가 얼마나 사용했는지
    const allRecentCount = await this.filterTopicId({
      topicId: recentTopic.topicId,
      posts: allPosts,
    });

    return {
      top: topTopic,
      recent: {
        topicId: recentTopic.topicId,
        count: allRecentCount.count,
      },
    };
  }
}
