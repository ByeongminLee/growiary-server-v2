import { Injectable } from '@nestjs/common';
import { PostDTO } from 'src/post/post.dto';
import { PostService } from 'src/post/post.service';
import { PostFilterService } from 'src/post/postFilter.service';
import { TopicDTO } from 'src/topic/topic.dto';
import { TopicRepository } from 'src/topic/topic.repository';
import toDate from 'src/utils/date';

@Injectable()
export class ReportService {
  constructor(
    private readonly postService: PostService,
    private readonly postFilterService: PostFilterService,
    private readonly topicRepository: TopicRepository,
  ) {}

  async report({ date }: { date: string }) {
    const year = date.split('-')[0];
    // const month = date.split('-')[1];

    // 모든 유저의 post 데이터
    const _posts = await this.postService.findAllPost();

    // 유저의 전체 post 데이터
    const _userPosts = await this.postService.findUserAllPost();

    // 모든 topic 데이터
    const topics = (await this.topicRepository.findAll()) as TopicDTO[];

    // 모든 유저의 year에 해당하는 post 데이터
    // const posts = await this.postFilterService.filterYear({
    //   posts: _posts,
    //   year,
    // });

    // 유저의 year에 해당하는 post 데이터
    const userPosts = await this.postFilterService.filterYear({
      posts: _userPosts,
      year,
    });
    const userPostsByMonth = await this.postFilterService.monthPost(userPosts);
    const userPostsMonth = userPostsByMonth[date];

    /**
     * 전체 기록
     */
    const all = await this.userAllPost(userPosts);

    // [기록한 추이]
    // 전체 데이터가 필요하다
    const { userMonthsCount, allUserMonthsCount } = await this.postMonth({
      date,
      posts: _posts,
      userPosts: _userPosts,
    });

    // [기록패턴: 요일]
    const weekPostCount = await this.postWeek(userPosts);

    // [기록패턴: 시간대]
    const timePostCount = await this.postTime(userPosts);

    // [기록분량: 글자수]
    const charactersCount = await this.charactersCountPost({
      date,
      posts: _userPosts,
      monthsToCount: 4,
    });
    // [기록 카테고리: 주제]
    const topic = await this.postTopic({ posts: userPostsMonth, topics });

    // [기록 태그]: 가장 많이 사용한 태그
    const tags = await this.tagCount(userPosts);
    // [태그] : 새로운 태그
    const newTags = await this.newTags(userPosts);

    return {
      all,
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
   * 유저의 전체 데이터를 받아서 글의 합, 평균, 최대값을 계산
   * @param posts
   * @returns 글의 합, 평균, 최대값
   */
  async userAllPost(posts: PostDTO[]) {
    const post = await this.postFilterService.postMonthRecord(posts);

    const charactersCount =
      await this.postFilterService.postMonthCharacterCount(posts);

    return { post, charactersCount };
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
    date,
  }: {
    posts: PostDTO[] | [];
    userPosts: PostDTO[] | [];
    date: string;
  }) {
    const userMonthsCount = await this.postFilterService.getPostCounts({
      posts: userPosts,
      date: date,
      monthsToCount: 7,
    });

    const allUserMonthsCount = await this.postFilterService.getPostCounts({
      posts: posts,
      date: date,
      monthsToCount: 7,
    });

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
        const koreanDate = new Date(cur.writeDate);
        koreanDate.setTime(koreanDate.getTime() + 9 * 60 * 60 * 1000); // UTC+9 시간대로 변환
        const month = koreanDate.getMonth();
        const day = koreanDate.getDay();
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
        const koreanDate = new Date(cur.writeDate);
        koreanDate.setTime(koreanDate.getTime() + 9 * 60 * 60 * 1000); // UTC+9 시간대로 변환

        const month = koreanDate.getMonth();
        const hour = koreanDate.getHours();
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
   * @description 글자수의 합, 평균, 상위 3개의 글 데이터를 계산
   * @param posts 유저의 post 데이터
   * @param date 기준 날짜
   * @param monthsToCount 최근 몇 개월을 계산할지
   * @returns 글자수의 합, 평균, 상위 3개의 글 데이터
   */
  async charactersCountPost({
    date,
    posts,
    monthsToCount,
  }: {
    date: string;
    posts: PostDTO[];
    monthsToCount: number;
  }) {
    const result: { [key: string]: { sum: number; avg: number; top3: any[] } } =
      {};

    // 주어진 date를 기준으로 시작 날짜와 끝 날짜를 계산합니다.
    const [year, month] = date.split('-').map(Number);
    const endDate = new Date(year, month - 1); // month는 0부터 시작하므로 -1 해줍니다.
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - (monthsToCount - 1)); // 시작 날짜를 계산합니다.

    // 각 달에 대한 결과를 계산합니다.
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setMonth(currentDate.getMonth() + 1)
    ) {
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const currentKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

      // 해당 달의 post를 필터링합니다.
      const filteredPosts = posts.filter((post) => {
        const postMonth = post.writeDate.getMonth() + 1;
        const postYear = post.writeDate.getFullYear();
        return postMonth === currentMonth && postYear === currentYear;
      });

      // sum과 avg를 계산합니다.
      let sum = 0;
      if (filteredPosts.length > 0) {
        sum = filteredPosts.reduce(
          (acc, post) => acc + post.charactersCount,
          0,
        );
      }
      const avg = sum / (filteredPosts.length || 1); // 분모가 0이 되는 것을 방지합니다.

      // top3를 계산합니다.
      const top3 = filteredPosts
        .sort((a, b) => b.charactersCount - a.charactersCount)
        .slice(0, 3);

      // 결과에 추가합니다.
      result[currentKey] = { sum, avg, top3 };
    }

    return result;
  }

  /**
   * [주제]에 사용하는 데이터
   * @description topic 카테고리별로 post데이터를 필터링
   * @param posts 유저의 post 데이터
   * @param topics 전체 topic 데이터
   * @returns 카테고리별 post 데이터
   */
  async postTopic({ posts, topics }: { posts: PostDTO[]; topics: TopicDTO[] }) {
    const categoryGroupTopic =
      await this.postFilterService.categoryGroupTopicId(topics);

    const result = Object.keys(categoryGroupTopic).reduce((acc, category) => {
      acc[category] = posts.filter((post) =>
        // categoryGroupTopic[category].find(
        //   (topicId) => String(topicId) == String(post.topicId),
        // ),
        categoryGroupTopic[category].includes(post.topicId),
      );

      return acc;
    }, {});

    return result;
  }

  /**
   * [태그]에 사용하는 데이터
   * @param posts 유저의 post 데이터
   * @returns 태그별로 사용된 횟수
   */
  async tagCount(posts: PostDTO[]) {
    return posts.reduce((acc, cur) => {
      const month = toDate(cur.writeDate).getMonth();
      if (!cur?.tags || cur?.tags.length === 0 || cur?.tags === undefined)
        return acc;
      cur?.tags.forEach((tag) => {
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

      if (post.tags === undefined) return;

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
