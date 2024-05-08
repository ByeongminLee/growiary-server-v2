import { Injectable } from '@nestjs/common';
import { TestCreatePostDTO } from './admin.dto';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
import { randomDate } from 'src/utils/admin';
import { TopicService } from 'src/topic/topic.service';

@Injectable()
export class AdminService {
  constructor(private readonly topicService: TopicService) {}

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
