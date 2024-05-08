import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDTO, PostDTO, UpdatePostDTO } from './post.dto';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { TopicRepository } from 'src/topic/topic.repository';
import { TopicDTO } from 'src/topic/topic.dto';
import { PostFilterService } from './postFilter.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly topicRepository: TopicRepository,
    private readonly postFilterService: PostFilterService,
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

    const monthsPost = await this.postRepository.findMonth({
      userId: uid,
      month,
    });

    if (monthsPost === 'NOT_FOUND') {
      return 'NOT_FOUND';
    }

    const posts = await this.postFilterService.postAddTopic({
      posts: monthsPost,
    });

    return posts;
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

    const postsAddTopic = await this.postFilterService.postAddTopic({
      posts: monthPost,
    });

    return { posts: postsAddTopic, category: categoryCount };
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

  /**
   * 어제 날짜로 부터 연속된 post 개수 반환
   */
  async continueRangePost() {
    const uid = this.request.user.uid;
    const posts: PostDTO[] = await this.postRepository.findAllUser({
      userId: uid,
    });
    const countPostsByDate = await this.countPostsByDate(posts);

    const result: { [date: string]: number } = {};
    let currentDate: string | null = new Date().toISOString().split('T')[0];

    // 오늘의 포스트 수를 초기화합니다.
    const todayCount: number = countPostsByDate[currentDate] || 0;

    // 오늘부터 시작하여 과거로 이동하며 연속된 날짜를 찾습니다.
    while (countPostsByDate[currentDate]) {
      // 현재 날짜에 해당하는 포스트 개수를 결과 객체에 저장합니다.
      result[currentDate] = countPostsByDate[currentDate];

      // 다음 날짜로 이동합니다.
      currentDate = new Date(new Date(currentDate).getTime() - 86400000)
        .toISOString()
        .split('T')[0];
    }

    // result example
    // "2024-05-06": 1,
    // "2024-05-05": 2,
    // "2024-05-04": 2

    // 결과 객체에서 최신 날짜부터 값을 추출하여 배열로 만듭니다.
    const continueValues = Object.values(result).reverse();

    // 반환할 객체를 구성하여 반환합니다.
    return { today: todayCount, continue: continueValues };
  }

  async countPostsByDate(posts: PostDTO[]) {
    const postCountsByDate: { [date: string]: number } = {};

    // 게시물을 날짜별로 그룹화하고 해당 날짜에 작성된 게시물 수를 셉니다.
    posts.forEach((post) => {
      // 게시물의 작성일을 yyyy-mm-dd 형식의 문자열로 변환하여 날짜만 가져옵니다.
      const postDate = post.writeDate.toISOString().split('T')[0];

      // 해당 날짜의 게시물 개수를 증가시킵니다.
      postCountsByDate[postDate] = (postCountsByDate[postDate] || 0) + 1;
    });

    return postCountsByDate;
  }
}
