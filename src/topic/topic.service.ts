import { Injectable } from '@nestjs/common';
import { CreateTopicDTO, TopicDTO, UpdateTopicDTO } from './topic.dto';
import { TopicRepository } from './topic.repository';
import { PostFilterService } from 'src/post/postFilter.service';
import { PostService } from 'src/post/post.service';
import { PostDTO, PostDTOWithTopic } from 'src/post/post.dto';
import toDate from 'src/utils/date';

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
    // posts에서 topicId가 65번이 아닌 것을 필터링
    // 자유주제 제외
    const filteredPosts = posts.filter(
      (post) => post.topicId && post.topicId != '65',
    );

    const topTopic = await this.postFilterService.filterTopTopic(filteredPosts);

    return topTopic;
  }

  // async recentTopic(posts: PostDTO[]) {
  //   const recentTopic = await this.postFilterService.recentPostTopic(posts);

  //   return recentTopic;
  // }

  /**
   * 가장 많이 사용된 topic
   * @returns topicId 가장 많이 사용된 topicId
   * @returns topic 해당 topicId의 topic 데이터
   * @returns user 해당 topicId를 사용한 유저 수
   * @returns count 전체 유저가 해당 topicId를 사용한 횟수
   */
  async recommendationTopic() {
    const allPosts = await this.postService.findAllPost();
    const topicList: TopicDTO[] = await this.findAllTopic();

    // growiary에서 가장 많이 사용된 topic {topicId, count}
    const topTopic = await this.topTopic(allPosts);

    const topic = topicList.find(
      (topic) => String(topic.id) === topTopic.topicId,
    );

    // 해당 topicId를 사용한 유저 수
    // 중복되지 않는 유저 수
    const users = await allPosts
      .filter(
        (post) =>
          post.topicId &&
          post.topicId == topTopic.topicId &&
          post.topicId != '65',
      )
      .map((post) => post.userId)
      .filter((userId, index, arr) => arr.indexOf(userId) === index).length;

    return {
      topicId: topTopic.topicId,
      topic,
      users,
      count: topTopic.count,
    };
  }

  /**
   * 최근 사용된 추천 topic
   * @returns topicId 최근 사용된 topicId
   * @returns topic 해당 topicId의 topic 데이터
   * @returns day 몇일 전에 기록했는지
   */
  async recentTopicPost() {
    const userPosts: PostDTOWithTopic[] =
      await this.postService.findUserAllPost();
    if (userPosts.length === 0) {
      return {};
    }

    // userPosts의 글중에 topicId가 사용이 한번도 없는지 체크
    const userPostsLen = userPosts.filter((post) => post.topicId).length;
    if (userPostsLen === 0) {
      return {};
    }

    // userPosts에서 가장 최근에 사용된 post
    // topicId가 65인 것은 제외
    const recentPost = userPosts
      .filter((post) => post.topicId && post.topicId != '65')
      .sort((a, b) => {
        return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
      });

    // recentPost[0].createdAt이 오늘로 부터몇일전인지 계산 (시간은 00시 00분으로 계산)
    const badeDay = toDate(recentPost[0].createdAt).getDate();
    const today = toDate(new Date()).getDate();
    const diff = today - badeDay;

    return {
      topicId: recentPost[0].topicId,
      topic: recentPost[0].topic,
      day: diff,
    };
  }

  /**
   * topicList를 category를 키로 가지고 해당하는 topic데이터를 value로 가지는 객체로 반환
   */
  async categoryGroupTopic() {
    const allTopics = (await this.findAllTopic()) as TopicDTO[];

    const result = await allTopics.reduce((groupedTopics, topic) => {
      const { category } = topic;

      if (!groupedTopics[category]) {
        groupedTopics[category] = [];
      }

      groupedTopics[category].push(topic);

      return groupedTopics;
    }, {});

    return result;
  }

  /**
   * topicList를 category를 키로 가지고 해당하는 topicId들을 배열로 value로 가지는 객체로 반환
   */
  async categoryGroupTopicId() {
    const allTopics = (await this.findAllTopic()) as TopicDTO[];

    return allTopics.reduce((groupedTopics, topic) => {
      const { category, id } = topic;

      if (!groupedTopics[category]) {
        groupedTopics[category] = [];
      }

      groupedTopics[category].push(id);

      return groupedTopics;
    }, {});
  }

  async categoryTopFilter({
    posts,
    categoryGroupTopic,
    categoryName,
  }: {
    posts: PostDTO[];
    categoryGroupTopic: any;
    categoryName: string;
  }): Promise<TopicDTO | object> {
    const categoryPost = await posts.filter((post) => {
      return categoryGroupTopic[categoryName].find(
        (topic) => String(topic.id) === String(post.topicId),
      );
    });

    if (categoryPost.length === 0) {
      return {};
    }

    // 해당 카테고리에 해당하는 post들 중 topTopic의 topicId
    const topTopic = await this.topTopic(categoryPost);
    const topic = await categoryGroupTopic[categoryName].find(
      (topic) => String(topic.id) === topTopic.topicId,
    );
    return topic;
  }

  /**
   * category별 topTopic
   * @returns category별 topTopic
   */
  async categoryTopTopic() {
    const allPosts = await this.postService.findAllPost();
    const categoryGroupTopic = await this.categoryGroupTopic();

    const dayThought = await this.categoryTopFilter({
      posts: allPosts,
      categoryGroupTopic,
      categoryName: '하루생각',
    });
    const selfExplore = await this.categoryTopFilter({
      posts: allPosts,
      categoryGroupTopic,
      categoryName: '자아탐험',
    });
    const creative = await this.categoryTopFilter({
      posts: allPosts,
      categoryGroupTopic,
      categoryName: '크리에이티브',
    });
    const review = await this.categoryTopFilter({
      posts: allPosts,
      categoryGroupTopic,
      categoryName: '회고',
    });

    return {
      하루생각: dayThought,
      자아탐험: selfExplore,
      크리에이티브: creative,
      회고: review,
    };
  }
}
