import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDTO, PostDTO, UpdatePostDTO } from './post.dto';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { TopicRepository } from 'src/topic/topic.repository';
import { TopicDTO } from 'src/topic/topic.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly topicRepository: TopicRepository,
  ) {}

  async createPost(createPostDTO: CreatePostDTO) {
    const uid = this.request.user.uid;
    return await this.postRepository.create({ createPostDTO, userId: uid });
  }

  /**
   * 전체 유저 post 반환
   * @returns 전체 유저 post 리스트
   */
  async findAllPost() {
    return await this.postRepository.findAll();
  }

  /**
   * 특정 유저의 post 반환
   * @returns 전체 유저 post 리스트
   */
  async findUserAllPost() {
    const uid = this.request.user.uid;

    return await this.postRepository.findAllUser({ userId: uid });
  }

  async findOnePost(postId: string) {
    const uid = this.request.user.uid;

    return await this.postRepository.findOne({ userId: uid, postId });
  }

  async findMonthPost(month: string) {
    const uid = this.request.user.uid;

    return await this.postRepository.findMonth({ userId: uid, month });
  }

  async myRecordPost(month: string) {
    const uid = this.request.user.uid;
    const monthPost = await this.postRepository.findMonth({
      userId: uid,
      month,
    });

    if (monthPost === 'NOT_FOUND') {
      return 'NOT_FOUND';
    }

    const groupTopicId = await this.categoryGroupTopicId();

    // 카테고리 별로 그룹핑
    const groupPost = Object.keys(groupTopicId).reduce((acc, category) => {
      const topicIds = groupTopicId[category];
      const categoryPost = monthPost.filter((post) =>
        topicIds.includes(Number(post.topicId)),
      );

      acc[category] = categoryPost;

      return acc;
    }, {});

    // 카테고리별 개수
    const categoryCount = Object.keys(groupPost).reduce((acc, category) => {
      acc[category] = groupPost[category].length;
      return acc;
    }, {});

    return { posts: monthPost, category: categoryCount };
  }

  async categoryGroupTopicId() {
    const allTopics = (await this.topicRepository.findAll()) as TopicDTO[];

    return allTopics.reduce((groupedTopics, topic) => {
      const { category, id } = topic;

      if (!groupedTopics[category]) {
        groupedTopics[category] = [];
      }

      groupedTopics[category].push(id);

      return groupedTopics;
    }, {});

    // return   {
    // >    '하루생각': [
    //   >      0, 1, 10, 11, 12, 13,
    //   >      2, 3,  4,  5,  6,  7,
    //   >      8, 9
    //   >    ],
    //   >    '자아탐험': [
    //   >      14, 15, 16, 17, 18, 19, 20, 21, 22,
    //   >      23, 24, 25, 26, 27, 28, 29, 30, 31,
    //   >      32, 33, 34, 35, 36, 37, 38, 39, 40,
    //   >      41, 42, 43, 44
    //   >    ],
    //   >    '크리에이티브': [
    //   >      45, 46, 47, 48, 49, 50,
    //   >      51, 52, 53, 54, 55, 56,
    //   >      57, 58, 59
    //   >    ],
    //   >    '회고': [ 60, 61, 62, 63, 64 ],
    //   >    '자유': [ 65 ]
    //   >  }
  }

  async updatePost(updatePostDTO: UpdatePostDTO) {
    const uid = this.request.user.uid;

    return await this.postRepository.update({ updatePostDTO, userId: uid });
  }

  /**
   * 주가 post 반환
   * @description 이번주에 작선된 post의 수를 요일별로 반환
   * @description 0: 일요일, 1: 월요일, 2: 화요일, 3: 수요일, 4: 목요일, 5: 금요일, 6: 토요일
   * @returns
   */
  async weeklyPost() {
    const uid = this.request.user.uid;
    const posts: PostDTO[] = await this.postRepository.findAllUser({
      userId: uid,
    });

    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setDate(today.getDate() + (6 - day));
    end.setHours(23, 59, 59, 999);

    const weeklyPosts = posts.filter(
      (post) =>
        new Date(post.writeDate) >= start && new Date(post.writeDate) <= end,
    );

    const weekly = Array(7).fill(0);
    weeklyPosts.forEach((post) => {
      const day = new Date(post.writeDate).getDay();
      weekly[day] += 1;
    });

    return weekly;
  }
}
