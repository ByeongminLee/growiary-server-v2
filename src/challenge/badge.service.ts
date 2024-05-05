import { Injectable } from '@nestjs/common';
import { PostRepository } from 'src/post/post.repository';
import { BadgePostService } from './badgePost.service';
import { TopicService } from 'src/topic/topic.service';

@Injectable()
export class BadgeService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly badgePostService: BadgePostService,
    private readonly topicService: TopicService,
  ) {}
  /**
   * 현재 가지고 있지 않는 뱃지를 얻을 수 있는지 확인하고 얻을 수 있다면 해당 뱃지 추가
   */
  async badgeCheck({
    currentBadge,
    userId,
  }: {
    currentBadge: any;
    userId: string;
  }) {
    const badgeList = currentBadge;
    const posts = await this.postRepository.findAllUser({ userId });
    const groupTopics = await this.topicService.categoryGroupTopicId();

    const _post1 = await this.post1({ badgeList, posts });
    const _post10 = await this.post10({ badgeList, posts });
    const _post100 = await this.post100({ badgeList, posts });
    const _earlyBird = await this.earlyBird({ badgeList, posts });
    const _owl = await this.owl({ badgeList, posts });
    const _balancer = await this.balancer({ badgeList, posts });
    const _godHand = await this.godHand({ badgeList, posts });
    const _selfWriter = await this.selfWriter({
      badgeList,
      posts,
      groupTopics,
    });
    const _growthWriter = await this.growthWriter({
      badgeList,
      posts,
      groupTopics,
    });
    const _dailyWriter = await this.dailyWriter({
      badgeList,
      posts,
      groupTopics,
    });

    // 2. 최종적으로 업데이트된 유저의 뱃지 정보 반환
    // 값이 없거나 undefined인 경우에는 반환하지 않음
    return {
      ...badgeList,
      ...(!!_post1 && { post1: _post1 }),
      ...(!!_post10 && { post10: _post10 }),
      ...(!!_post100 && { post100: _post100 }),
      ...(!!_earlyBird && { earlyBird: _earlyBird }),
      ...(!!_owl && { owl: _owl }),
      ...(!!_balancer && { balancer: _balancer }),
      ...(!!_godHand && { godHand: _godHand }),
      ...(!!_selfWriter && { selfWriter: _selfWriter }),
      ...(!!_growthWriter && { growthWriter: _growthWriter }),
      ...(!!_dailyWriter && { dailyWriter: _dailyWriter }),
    };
  }

  /**
   * 초보 기록가 post1
   * @description 첫 post 작성자
   */
  async post1({ badgeList, posts }) {
    // badgeList에 post1이 있으면 그냥 return
    if (badgeList.post1) {
      return;
    }

    if (posts.length > 0) {
      return {
        key: 'post1',
        name: '초보 기록가',
        acquired: true,
        acquiredDate: posts[0].createdAt,
      };
    }
  }
  /**
   * 활발한 기록가 post10
   * @description 10일 이상 연속으로 기록한 사용자
   */
  async post10({ badgeList, posts }) {
    if (badgeList.post10) {
      return;
    }
    const consecutiveWriteDate =
      await this.badgePostService.findConsecutivePosts(posts, 10);

    if (!consecutiveWriteDate) {
      return;
    }

    return {
      key: 'post10',
      name: '활발한 기록가',
      acquired: true,
      acquiredDate: consecutiveWriteDate,
    };
  }
  /**
   * 열정의 기록가 (Rare) post100
   * @description 100일 이상 연속으로 기록한 사용자
   */
  async post100({ badgeList, posts }) {
    if (badgeList.post100) {
      return;
    }
    const consecutiveWriteDate =
      await await this.badgePostService.findConsecutivePosts(posts, 100);

    if (!consecutiveWriteDate) {
      return;
    }

    return {
      key: 'post100',
      name: '열정의 기록가',
      acquired: true,
      acquiredDate: consecutiveWriteDate,
    };
  }

  /**
   * 얼리버드 earlyBird
   * @description 05:00 ~ 08:00에 작성한 기록이 3개 이상
   */
  async earlyBird({ badgeList, posts }) {
    if (badgeList.earlyBird) {
      return;
    }

    const consecutiveWriteDates =
      await await this.badgePostService.findPostsInTimeRange(
        posts,
        '05:00~08:00',
        3,
      );

    if (!consecutiveWriteDates.length) {
      return;
    }

    return {
      key: 'earlyBird',
      name: '얼리버드',
      acquired: true,
      acquiredDate: consecutiveWriteDates[0],
    };
  }
  /**
   * 올빼미 owl
   * @description 23:00 ~ 02:00에 작성한 기록이 3개 이상
   */
  async owl({ badgeList, posts }) {
    if (badgeList.owl) {
      return;
    }

    const consecutiveWriteDates =
      await await this.badgePostService.findPostsInTimeRange(
        posts,
        '23:00~02:00',
        3,
      );

    if (!consecutiveWriteDates.length) {
      return;
    }

    return {
      key: 'owl',
      name: '올빼미',
      acquired: true,
      acquiredDate: consecutiveWriteDates[0],
    };
  }

  /**
   * 균형 기록러 (Rare) balancer
   * @description 50개 이상의 topicId를 가진 사용자
   */
  async balancer({ badgeList, posts }) {
    if (badgeList.balancer) {
      return;
    }

    const topicIdCount = posts.reduce((acc, post) => {
      if (!acc[post.topicId]) {
        acc[post.topicId] = 1;
      } else {
        acc[post.topicId]++;
      }
      return acc;
    }, {});

    const topicIdCountArray = Object.values(topicIdCount);
    const topicIdCountArrayLength = topicIdCountArray.length;

    if (topicIdCountArrayLength < 50) {
      return;
    }

    return {
      key: 'balancer',
      name: '균형 기록러',
      acquired: true,
      acquiredDate: posts[topicIdCountArrayLength - 1].createdAt,
    };
  }
  /**
   * 신의 손 godHand
   * @description 작성한 글의 월간 기준으로 평균이 500자를 넘어가는 유저
   */
  async godHand({ badgeList, posts }) {
    if (badgeList.godHand) {
      return;
    }

    const nextMonth = await this.badgePostService.getNextMonthWithExceededCount(
      posts,
      500,
      5,
    );

    if (!nextMonth) {
      return;
    }

    return {
      key: 'godHand',
      name: '신의 손',
      acquired: true,
      acquiredDate: nextMonth,
    };
  }
  /**
   * 자아 탐험가 selfWriter
   * @description 자아 탐험 카테고리 10개 이상 작성
   */
  async selfWriter({ badgeList, posts, groupTopics }) {
    if (badgeList.selfWriter) {
      return;
    }

    const selfTopicId = groupTopics['자아탐험'].map((topic) => topic.topicId);

    const selfCount = posts.filter((post) =>
      selfTopicId.includes(post.topicId),
    ).length;

    if (selfCount < 10) {
      return;
    }

    return {
      key: 'selfWriter',
      name: '자아 탐험가',
      acquired: true,
      acquiredDate: posts[selfCount - 1].createdAt,
    };
  }
  /**
   * 성장하는 기록가 growthWriter
   * @description 회고 카테고리 30개 이상 작성
   */
  async growthWriter({ badgeList, posts, groupTopics }) {
    if (badgeList.growthWriter) {
      return;
    }

    const growthTopicId = groupTopics['성장'].map((topic) => topic.topicId);

    const growthCount = posts.filter((post) =>
      growthTopicId.includes(post.topicId),
    ).length;

    if (growthCount < 30) {
      return;
    }

    return {
      key: 'growthWriter',
      name: '성장하는 기록가',
      acquired: true,
      acquiredDate: posts[growthCount - 1].createdAt,
    };
  }

  /**
   * 일상 감상가 dailyWriter
   * @description 하루생각 카테고리 30개 이상 작성
   */
  async dailyWriter({ badgeList, posts, groupTopics }) {
    if (badgeList.dailyWriter) {
      return;
    }

    const dailyTopicId = groupTopics['하루생각'].map((topic) => topic.topicId);

    const dailyCount = posts.filter((post) =>
      dailyTopicId.includes(post.topicId),
    ).length;

    if (dailyCount < 30) {
      return;
    }

    return {
      key: 'dailyWriter',
      name: '일상 감상가',
      acquired: true,
      acquiredDate: posts[dailyCount - 1].createdAt,
    };
  }

  /**
   * 자유로운 기록가 freeWriter
   * @description 자유 작성 30개 이상
   */
  /**
   * 그루어리 홀릭 growiaryHolic
   * @description 30일 이상 연속 접속
   */
}
