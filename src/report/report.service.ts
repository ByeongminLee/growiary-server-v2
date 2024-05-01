import { Injectable } from '@nestjs/common';
import { PostDTO } from 'src/post/post.dto';
import { PostService } from 'src/post/post.service';
import { PostFilterService } from 'src/post/postFilter.service';
import { TopicDTO } from 'src/topic/topic.dto';
import { TopicRepository } from 'src/topic/topic.repository';

@Injectable()
export class ReportService {
  constructor(
    private readonly postService: PostService,
    private readonly postFilterService: PostFilterService,
    private readonly topicRepository: TopicRepository,
  ) {}

  async report() {
    // 모든 유저의 post 데이터
    const posts = await this.postService.findAllPost();

    // 유저의 전체 post 데이터
    const userPosts = await this.postService.findUserAllPost();

    // [기록한 글]
    const { userMonthsCount, allUserMonthsCount } = await this.postMonth({
      posts,
      userPosts,
    });

    // [요일]
    const weekPostCount = await this.postWeek(posts);

    // [시간대]
    const timePostCount = await this.postTime(posts);

    // [글자수]
    const charactersCount = await this.charactersCountPost(posts);

    // [주제]
    const topic = await this.postTopic(posts);

    // [태그]: 가장 많이 사용한 태그
    const tags = await this.tagCount(posts);
    // [태그] : 새로운 태그
    const newTags = await this.newTags(posts);

    return {
      post: { user: userMonthsCount, all: allUserMonthsCount },
      week: weekPostCount,
      time: timePostCount,
      charCount: charactersCount,
      topic,
      tags,
      newTags,
    };
  }

  /**
   * [기록한 글]에 사용하는 데이터
   * @param posts 전체 유저의 데이터
   * @param posts 유저의 데이터
   * @returns userMonthsCount 유저의 월별 작성 글 개수
   * @returns allUserMonthsCount: 전체 유저의 월별 작성 글 개수
   */
  async postMonth({
    posts,
    userPosts,
  }: {
    posts: PostDTO[] | [];
    userPosts: PostDTO[] | [];
  }) {
    const userMonthsCount =
      await this.postFilterService.monthCountPost(userPosts);

    const allUserMonthsCount =
      await this.postFilterService.monthCountPost(posts);

    return {
      userMonthsCount,
      allUserMonthsCount,
    };
  }

  /**
   * [요일]에 사용하는 데이터
   * @description 0 ~ 6 (일 ~ 토) 요일별로 작성 글 개수를 계산
   * @param posts 유저의 post 데이터
   * @returns weekPostCount 요일별 작성 글 개수
   */
  async postWeek(posts: PostDTO[]) {
    return posts.reduce(
      (acc, cur) => {
        const month = new Date(cur.writeDate).getMonth();
        const day = new Date(cur.writeDate).getDay();
        acc[month][day] = acc[month][day] ? acc[month][day] + 1 : 1;
        return acc;
      },
      Array(12)
        .fill(0)
        .map(() => Array(7).fill(0)),
    );
  }

  /**
   * [시간대]에 사용하는 데이터
   * @description 0 ~ 3 (새벽, 아침, 점심, 저녁) 시간대로 나누어 작성 글 개수를 계산
   * @param posts 유저의 post 데이터
   * @returns timePostCount 시간대별 작성 글 개수
   */
  async postTime(posts: PostDTO[]) {
    return posts.reduce(
      (acc, cur) => {
        const month = new Date(cur.writeDate).getMonth();
        const hour = new Date(cur.writeDate).getHours();
        if (hour < 6) {
          acc[month][0] = acc[month][0] ? acc[month][0] + 1 : 1;
        } else if (hour < 12) {
          acc[month][1] = acc[month][1] ? acc[month][1] + 1 : 1;
        } else if (hour < 18) {
          acc[month][2] = acc[month][2] ? acc[month][2] + 1 : 1;
        } else {
          acc[month][3] = acc[month][3] ? acc[month][3] + 1 : 1;
        }
        return acc;
      },
      Array(12)
        .fill(0)
        .map(() => Array(4).fill(0)),
    );
  }

  /**
   * [글자수]에 사용하는 데이터
   * @param posts 유저의 post 데이터
   * @returns charactersCount 글자수 데이터
   */
  async charactersCountPost(posts: PostDTO[]) {
    return posts.reduce(
      (acc, cur) => {
        const month = new Date(cur.writeDate).getMonth();
        acc[month] = acc[month]
          ? {
              sum: acc[month].sum + cur.charactersCount,
              avg: (acc[month].avg + cur.charactersCount) / 2,
              top3:
                acc[month].top3.length < 3
                  ? [...acc[month].top3, cur]
                  : acc[month].top3
                      .sort((a, b) => b.charactersCount - a.charactersCount)
                      .slice(0, 2),
            }
          : { sum: cur.charactersCount, avg: cur.charactersCount, top3: [cur] };
        return acc;
      },
      Array(12).fill({ sum: 0, avg: 0, top3: [] }),
    );
  }

  /**
   * [주제]에 사용하는 데이터
   * @param posts 유저의 post 데이터
   * @returns categorizedPostsByMonth 월별로 카테고리별로 그룹화된 데이터
   */
  async postTopic(posts: PostDTO[]) {
    // 1. 월별로 posts를 구분
    const postsByMonth: { [month: number]: PostDTO[] } = {};
    posts.forEach((post) => {
      const month = new Date(post.writeDate).getMonth() + 1;
      if (!postsByMonth[month]) {
        postsByMonth[month] = [];
      }
      postsByMonth[month].push(post);
    });

    // 2. 모든 topic 데이터 가져오기
    const topics = (await this.topicRepository.findAll()) as TopicDTO[];

    // 3. 월별로 post를 처리하며 category를 매칭하여 그룹화
    const categorizedPostsByMonth: Array<{ [category: string]: PostDTO[] }> =
      [];
    for (let month = 1; month <= 12; month++) {
      const categorizedPosts: { [category: string]: PostDTO[] } = {};
      const postsOfMonth = postsByMonth[month] || [];
      for (const post of postsOfMonth) {
        // postId를 tokenId로 변환하고 category를 가져오기
        const topic = topics.find((topic) => topic.id === Number(post.topicId));
        const category = topic ? topic.category : 'Uncategorized';
        if (!categorizedPosts[category]) {
          categorizedPosts[category] = [];
        }
        categorizedPosts[category].push(post);
      }
      categorizedPostsByMonth.push(categorizedPosts);
    }

    return categorizedPostsByMonth;
  }

  /**
   * [태그]에 사용하는 데이터
   * @param posts 유저의 post 데이터
   * @returns 태그별로 사용된 횟수
   */
  async tagCount(posts: PostDTO[]) {
    return posts.reduce((acc, cur) => {
      const month = new Date(cur.writeDate).getMonth();
      cur.tags.forEach((tag) => {
        acc[month] = acc[month]
          ? {
              ...acc[month],
              [tag]: acc[month][tag] ? acc[month][tag] + 1 : 1,
            }
          : { [tag]: 1 };
      });
      return acc;
    }, Array(12).fill({}));
  }

  /**
   * [태그]에 사용하는 데이터
   * @param posts 유저의 post 데이터
   * @returns 해당 달별 새롭게 추가된 태그
   */
  async newTags(posts: PostDTO[]): Promise<{ [tag: string]: PostDTO[] }[]> {
    // 1. 월별 빈 배열 생성
    const monthlyTags: { [tag: string]: PostDTO[] }[] = Array.from(
      { length: 12 },
      () => ({}),
    );

    // 객체를 사용하여 태그를 키로 사용하고 해당 태그가 사용된 포스트 값을 추적
    const tagPostsMap: { [tag: string]: PostDTO[] } = {};

    // 객체를 사용하여 태그의 등장 여부를 추적
    const tagFirstAppearances: { [tag: string]: Date } = {};

    // 2. 포스트를 월별로 필터링하고 태그의 등장 여부를 확인하여 포스트 추가
    posts.forEach((post) => {
      const monthIndex = new Date(post.writeDate).getMonth();
      const monthTags = monthlyTags[monthIndex];

      post.tags.forEach((tag) => {
        if (
          !(tag in tagFirstAppearances) ||
          tagFirstAppearances[tag] > post.writeDate
        ) {
          tagFirstAppearances[tag] = post.writeDate;
          if (!(tag in tagPostsMap)) {
            tagPostsMap[tag] = [];
          }
          tagPostsMap[tag].push(post);
          monthTags[tag] = tagPostsMap[tag];
        }
      });
    });

    return monthlyTags;
  }
}
