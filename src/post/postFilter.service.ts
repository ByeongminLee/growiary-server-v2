import { Injectable } from '@nestjs/common';
import { PostDTO } from 'src/post/post.dto';
import { TopicDTO } from 'src/topic/topic.dto';
import { TopicRepository } from 'src/topic/topic.repository';

@Injectable()
export class PostFilterService {
  constructor(private readonly topicRepository: TopicRepository) {}

  /**
   * post데이터를 년과월별로 필터링
   * @description key에는 "2024-05" 형태로 반환
   * @param posts
   * @returns { [key: number]: PostDTO[] }
   */
  async monthPost(posts: PostDTO[]): Promise<{ [key: number]: PostDTO[] }> {
    return posts.reduce((acc, cur) => {
      const month = new Date(cur.writeDate).getMonth() + 1;
      const year = new Date(cur.writeDate).getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      acc[key] = acc[key] ? [...acc[key], cur] : [cur];
      return acc;
    }, {});
  }

  /**
   * post데이터를 월별로 작성한 글 개수
   * @description 배열 형태로 반환하며 index 0은 1월, index 11은 12월식으로 하고 빈 월은 0으로 표기
   */
  async monthCountPost(posts: PostDTO[]): Promise<{ [key: number]: number }> {
    return posts.reduce((acc, cur) => {
      const month = new Date(cur.writeDate).getMonth();
      acc[month] = acc[month] ? acc[month] + 1 : 1;
      return acc;
    }, Array(12).fill(0));
  }

  /**
   * post데이터를 월별로, 작성한 글의 글자수로 필터링
   * description key는 각 작성달, value는 해당 달의 글자수
   * @param posts
   * @returns { [key: number]: number }
   */
  async charactersCountPost(
    posts: PostDTO[],
  ): Promise<{ [key: number]: number }> {
    return posts.reduce((acc, cur) => {
      const month = new Date(cur.writeDate).getMonth() + 1;
      acc[month] = acc[month]
        ? acc[month] + cur.charactersCount
        : cur.charactersCount;
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 요일별로 필터링
   * @param posts
   * @description key: 0 ~ 6 (일 ~ 토)
   * @returns { [key: number]: PostDTO[] }
   */
  async dayWeekPost(posts: PostDTO[]) {
    return posts.reduce((acc, cur) => {
      const day = new Date(cur.writeDate).getDay();
      acc[day] = acc[day] ? [...acc[day], cur] : [cur];
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 요일별로 작성한 글 개수
   * @param posts
   * @description key: 0 ~ 6 (일 ~ 토)
   * @returns { [key: number]: number }
   */
  async dayOfWeekCountPost(
    posts: PostDTO[],
  ): Promise<{ [key: number]: number }> {
    return posts.reduce((acc, cur) => {
      const day = new Date(cur.writeDate).getDay();
      acc[day] = acc[day] ? acc[day] + 1 : 1;
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 작성 시간대별로 분류하여 필터링
   * @description 새벽(dawn): 00:00 - 06:00
     아침(morning): 06:00 - 12:00
     점심(lunch): 12:00 - 18:00
     저녁(dinner): 18:00 - 24:00
   * @param posts
   * @returns { [key: string]: PostDTO[] }
   */
  async timePost(posts: PostDTO[]): Promise<{ [key: string]: PostDTO[] }> {
    return posts.reduce((acc, cur) => {
      const hour = new Date(cur.writeDate).getHours();
      if (hour >= 0 && hour < 6) {
        acc['dawn'] = acc['dawn'] ? [...acc['dawn'], cur] : [cur];
      } else if (hour >= 6 && hour < 12) {
        acc['morning'] = acc['morning'] ? [...acc['morning'], cur] : [cur];
      } else if (hour >= 12 && hour < 18) {
        acc['lunch'] = acc['lunch'] ? [...acc['lunch'], cur] : [cur];
      } else {
        acc['dinner'] = acc['dinner'] ? [...acc['dinner'], cur] : [cur];
      }
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 작성 시간대별로 작성한 글 개수
   * @description 새벽(dawn): 00:00 - 06:00
     아침(morning): 06:00 - 12:00
     점심(lunch): 12:00 - 18:00
     저녁(dinner): 18:00 - 24:00
   * @param posts
   * @returns { [key: string]: number }
   */
  async timeCountPost(posts: PostDTO[]): Promise<{ [key: string]: number }> {
    return posts.reduce((acc, cur) => {
      const hour = new Date(cur.writeDate).getHours();
      if (hour >= 0 && hour < 6) {
        acc['dawn'] = acc['dawn'] ? acc['dawn'] + 1 : 1;
      } else if (hour >= 6 && hour < 12) {
        acc['morning'] = acc['morning'] ? acc['morning'] + 1 : 1;
      } else if (hour >= 12 && hour < 18) {
        acc['lunch'] = acc['lunch'] ? acc['lunch'] + 1 : 1;
      } else {
        acc['dinner'] = acc['dinner'] ? acc['dinner'] + 1 : 1;
      }
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 월별 작성일 기준으로 각 태그별로 필터링
   * @description key는 각 작성달, value는 해당 달의 tag
   * @param posts
   */
  async tagPost(posts: PostDTO[]): Promise<{ [key: string]: PostDTO[] }> {
    return posts.reduce((acc, cur) => {
      const month = new Date(cur.writeDate).getMonth() + 1;
      acc[month] = acc[month] ? [...acc[month], cur] : [cur];
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 topicId별로 필터링
   * @description key: topicId (topicId가 없을 경우 제외)
   * @param posts
   */
  async topicPost(posts: PostDTO[]): Promise<{ [key: string]: PostDTO[] }> {
    return posts.reduce((acc, cur) => {
      if (!cur.topicId) return acc;
      acc[cur.topicId] = acc[cur.topicId] ? [...acc[cur.topicId], cur] : [cur];
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 topicId별로 작성한 글 개수
   * @description key: topicId (topicId가 없을 경우 제외)
   * @description {[key: number]: number}
   * @param posts
   */
  async filterTopicTop(posts: PostDTO[]): Promise<{ [key: string]: number }> {
    return posts.reduce((acc, cur) => {
      if (!cur.topicId) return acc;
      acc[cur.topicId] = acc[cur.topicId] ? acc[cur.topicId] + 1 : 1;
      return acc;
    }, {});
  }

  /**
   * post데이터를 넣으면 총 작성 글자수를 반환
   * @param posts
   * @returns number
   */
  async totalCharactersCount(posts: PostDTO[]): Promise<number> {
    return posts.reduce((acc, cur) => acc + cur.charactersCount, 0);
  }

  async recentPostTopic(posts: PostDTO[]) {
    const sortedPosts = posts.sort((a, b) =>
      a.writeDate < b.writeDate ? 1 : -1,
    );

    let recentTopicId = null;
    for (const post of sortedPosts) {
      // topicId가 65번이 아닌 것이 최근에 작성한 글의 topicId (65는 자유주제)
      if (post.topicId && post.topicId != '65') {
        recentTopicId = post.topicId;
        break;
      }
    }

    if (!recentTopicId) {
      for (const post of sortedPosts) {
        if (post.topicId) {
          recentTopicId = post.topicId;
          break;
        }
      }
    }

    const count = posts.filter((post) => post.topicId === recentTopicId).length;

    return recentTopicId ? { topicId: recentTopicId, count } : null;
  }

  async filterTopTopic(
    posts: PostDTO[],
  ): Promise<{ topicId: string; count: number }> {
    const topTopic = posts.reduce((acc, cur) => {
      if (!cur.topicId) return acc;
      acc[cur.topicId] = acc[cur.topicId] ? acc[cur.topicId] + 1 : 1;
      return acc;
    }, {});

    const topicId = Object.keys(topTopic).reduce((a, b) =>
      topTopic[a] > topTopic[b] ? a : b,
    );

    return { topicId, count: topTopic[topicId] };
  }

  /**
   * post데이터를 넣으면 해당 년도에 해당하는 데이터만 필터링
   */
  async filterYear({
    posts,
    year,
  }: {
    posts: PostDTO[];
    year: string;
  }): Promise<PostDTO[]> {
    return posts.filter(
      (post) => new Date(post.writeDate).getFullYear() === +year,
    );
  }

  /**
   * post 데이터를 넣으면 topicId값에 해당하는 topic 데이터를 같이 반환
   */
  async postAddTopic({ posts }: { posts: PostDTO[] }) {
    const topicList: TopicDTO[] = await this.topicRepository.findAll();
    return posts.map((post) => {
      const topic = topicList.find((topic) => String(topic.id) == post.topicId);
      return { ...post, topic };
    });
  }

  /**
   *
   * @param posts post 데이터
   * @param date yyyy-mm 형식
   * @param monthsToCount 최근 몇 달까지의 데이터를 계산할 것인지
   * @returns
   */
  getPostCounts({
    posts,
    date,
    monthsToCount,
  }: {
    posts: PostDTO[];
    date: string;
    monthsToCount: number;
  }): Record<string, number> {
    // 반환될 결과를 담을 객체 생성
    const result: Record<string, number> = {};

    // 입력받은 currentDate를 기준으로 최근 monthsToCount달까지의 날짜를 배열에 저장
    const dateArray = [];
    const current = new Date(date);
    for (let i = 0; i < monthsToCount; i++) {
      dateArray.push(current.toISOString().slice(0, 7)); // 'yyyy-mm' 형식으로 변환하여 저장
      current.setMonth(current.getMonth() - 1); // 이전 달로 이동
    }

    // 결과 객체에 각 날짜별 작성된 게시물 수 계산하여 저장
    for (const dateItem of dateArray) {
      const count = posts.filter(
        (post) => post.writeDate.toISOString().slice(0, 7) === dateItem,
      ).length;
      result[dateItem] = count;
    }

    return result;
  }

  /**
   * posts 데이터를 받아서 월별로 평균 작성개수를 계산
   */
  async postMonthRecord(posts: PostDTO[]): Promise<Record<string, number>> {
    // 월별로 작성된 게시물 수를 저장할 객체 생성
    const monthCount: Record<string, number> = {};

    // 월별로 작성된 게시물 수 계산
    posts.forEach((post) => {
      const month = post.writeDate.getMonth() + 1;
      monthCount[month] = monthCount[month] ? monthCount[month] + 1 : 1;
    });

    const sum = Object.values(monthCount).reduce((acc, cur) => acc + cur, 0);

    const avg = sum / Object.keys(monthCount).length;

    // 월별 max
    const max = Math.max(...Object.values(monthCount));

    return { sum, avg, max };
  }

  /**
   * posts 데이터를 받아서 월별로 작성한 글자수와 전체 글자수
   */
  async postMonthCharacterCount(posts: PostDTO[]) {
    // 월별로 작성된 글자수를 저장할 객체 생성
    const monthCharacterCount: Record<string, number> = {};

    // 월별로 작성된 글자수 계산
    posts.forEach((post) => {
      const month = post.writeDate.getMonth() + 1;
      monthCharacterCount[month] = monthCharacterCount[month]
        ? monthCharacterCount[month] + post.charactersCount
        : post.charactersCount;
    });

    console.log('monthCharacterCount', monthCharacterCount);

    const sum = Object.values(monthCharacterCount).reduce(
      (acc, cur) => acc + cur,
      0,
    );

    const avg = sum / Object.keys(monthCharacterCount).length;

    return { sum, avg };
  }

  /**
   * topicList를 category를 키로 가지고 해당하는 topic데이터를 value로 가지는 객체로 반환
   */
  async categoryGroupTopicId(topics: TopicDTO[]) {
    return topics.reduce((groupedTopics, topic) => {
      const { category, id } = topic;

      if (!groupedTopics[category]) {
        groupedTopics[category] = [];
      }

      groupedTopics[category].push(id);

      return groupedTopics;
    }, {});
  }
}
