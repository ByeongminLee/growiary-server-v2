import { Injectable } from '@nestjs/common';
import { TestCreatePostDTO } from './admin.dto';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
import { randomDate } from 'src/utils/admin';
import { TopicService } from 'src/topic/topic.service';
import toDate from 'src/utils/date';

@Injectable()
export class AdminService {
  constructor(private readonly topicService: TopicService) {}

  /**
   * 전체 유저 데이터 반환
   */
  async findAllUser() {
    const userDoc = await firestore().collection('users').get();
    const profileDoc = await firestore().collection('profile').get();
    const badgeDoc = await firestore().collection('badge').get();

    // userData에 userId에 맞는 profile, badge 데이터 추가
    return userDoc.docs.map((doc) => {
      const data = doc.data();
      const profile = profileDoc.docs.find(
        (profile) => profile.id === data.uid,
      );
      const badge = badgeDoc.docs.find((badge) => badge.id === data.uid);

      return {
        ...data,
        profile: profile?.data(),
        badge: badge?.data(),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    });
  }

  /**
   * 테스트용 포스트 생성
   * @param testCreatePostDTO
   */
  async testCreatePost(testCreatePostDTO: TestCreatePostDTO) {
    const post = firestore().collection('post').doc(testCreatePostDTO.userId);

    const lastIdx = await post.get().then((doc) => {
      if (doc.exists) {
        return Object.values(doc.data()).length;
      } else {
        return 0;
      }
    });

    // count 개수만큼 더미 데이터 생성 하기 위한 코드
    const postDummy = {};
    for (let i = 0; i < testCreatePostDTO.count; i++) {
      const postUniqueKey = uuidv4();

      let writeDate = new Date();
      if (testCreatePostDTO.startDate && testCreatePostDTO.endDate) {
        writeDate = randomDate({
          startDate: testCreatePostDTO.startDate,
          endDate: testCreatePostDTO.endDate,
        });
      }

      let topicId = '65'; // 자유 카테고리
      if (testCreatePostDTO.category) {
        topicId = await this.randomTopicIdByCategory(
          testCreatePostDTO.category,
        );
      }

      postDummy[postUniqueKey] = {
        id: postUniqueKey,
        title: `test ${postUniqueKey} - ${lastIdx + i}`,
        content: '',
        writeDate: writeDate,
        status: true,
        topicId: topicId,
        index: lastIdx + i + 1,
        charactersCount: Math.floor(Math.random() * 1000) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    await post.set(postDummy, { merge: true });

    return postDummy;
  }

  async randomTopicIdByCategory(category: string) {
    const topic = await this.topicService.categoryGroupTopicId();
    const topicId = topic[category];
    const randomTopicId = topicId[Math.floor(Math.random() * topicId.length)];
    return randomTopicId;
  }
}
