import { Injectable } from '@nestjs/common';
import { PostDTO } from '../post/post.dto';
import toDate from 'src/utils/date';

interface MonthlyCharacterCount {
  month: number;
  year: number;
  totalCharacters: number;
  postCount: number;
}

@Injectable()
export class BadgePostService {
  constructor() {}
  async findConsecutivePosts(posts: PostDTO[], N: number) {
    let consecutiveCount = 1;
    let consecutiveWriteDate = null;

    for (let i = 1; i < posts.length; i++) {
      const prevWriteDate = new Date(posts[i - 1].writeDate);
      const currentWriteDate = new Date(posts[i].writeDate);

      // 이전 포스트와 현재 포스트의 writeDate가 같으면 연속된 포스트임
      if (prevWriteDate.getTime() === currentWriteDate.getTime()) {
        consecutiveCount++;

        // 연속된 포스트의 수가 N 이상이면 해당 writeDate를 반환
        if (consecutiveCount >= N) {
          consecutiveWriteDate = prevWriteDate;
          break;
        }
      } else {
        // writeDate가 다른 경우 연속된 포스트의 카운트 초기화
        consecutiveCount = 1;
      }
    }

    return consecutiveWriteDate;
  }

  /**
   * N개 이상의 포스트가 특정 시간대에 작성되었는지 확인
   * @param posts
   * @param time 'HH:mm~HH:mm'
   * @param N
   */
  async findPostsInTimeRange(posts: PostDTO[], time: string, N: number) {
    const [startHour, endHour] = time
      .split('~')
      .map((part) => parseInt(part.split(':')[0]));

    const filteredPosts = posts.filter((post) => {
      const createHour =
        post.createdAt instanceof Date
          ? post.createdAt.getHours()
          : post.createdAt.toDate().getHours();

      if (startHour <= endHour) {
        return createHour >= startHour && createHour <= endHour;
      } else {
        return createHour >= startHour || createHour <= endHour;
      }
    });

    const consecutiveCreateDates: Date[] = [];

    for (let i = 0; i < filteredPosts.length - N + 1; i++) {
      let consecutiveCount = 1;
      const consecutiveDates = [toDate(filteredPosts[i].createdAt)];

      for (let j = i + 1; j < filteredPosts.length; j++) {
        const prevCreateDate = toDate(filteredPosts[j - 1].createdAt);
        const currentCreateDate = toDate(filteredPosts[j].createdAt);

        if (prevCreateDate.getTime() === currentCreateDate.getTime()) {
          consecutiveCount++;
          consecutiveDates.push(currentCreateDate);

          if (consecutiveCount >= N) {
            consecutiveCreateDates.push(...consecutiveDates);
            break;
          }
        } else {
          break;
        }
      }
    }

    return consecutiveCreateDates;
  }

  /**
   * 평균이 count를 넘는 월을 찾아 다음 달 반환
   * @param posts
   * @param count 평균 글 작성량
   * @param N N개 이상의 포스트가 있어야 함
   */
  getNextMonthWithExceededCount(
    posts: PostDTO[],
    count: number,
    N: number,
  ): Date | null {
    // 월별 글 작성량을 저장할 Map
    const monthlyCounts = new Map<string, MonthlyCharacterCount>();

    // 월별 글 작성량 계산
    for (const post of posts) {
      const writeDate = toDate(post.createdAt);
      const monthKey = `${writeDate.getFullYear()}-${writeDate.getMonth()}`;

      if (!monthlyCounts.has(monthKey)) {
        monthlyCounts.set(monthKey, {
          month: writeDate.getMonth(),
          year: writeDate.getFullYear(),
          totalCharacters: 0,
          postCount: 0,
        });
      }

      const monthlyCount = monthlyCounts.get(monthKey)!;
      monthlyCount.totalCharacters += post.charactersCount;
      monthlyCount.postCount++;
    }

    // 평균을 넘는 월을 찾아 다음 달 반환
    for (const [monthKey, monthlyCount] of monthlyCounts.entries()) {
      const averageCharacterCount =
        monthlyCount.totalCharacters / monthlyCount.postCount;
      if (averageCharacterCount > count && monthlyCount.postCount >= N) {
        const [year, month] = monthKey.split('-').map(Number);
        const nextMonth = new Date(year, month + 1, 1);
        return nextMonth;
      }
    }

    return null; // 평균을 넘는 월이 없는 경우
  }
}
