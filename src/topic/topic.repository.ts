import { Injectable } from '@nestjs/common';
import { CreateTopicDTO, TopicDTO, UpdateTopicDTO } from './topic.dto';
import { firestore } from 'firebase-admin';

@Injectable()
export class TopicRepository {
  constructor() {}

  /**
   * 모든 추천 주제 반환
   * @description 활성화된 값만 반환
   * @returns 모든 추천 주제 데이터 리스트
   */
  async findAll(): Promise<TopicDTO[] | []> {
    const topicDocs = await firestore()
      .collection('topic')
      .where('status', '==', true)
      .get();

    if (!topicDocs.empty) {
      const topics = topicDocs.docs.map((doc) => {
        const data = doc.data();

        const createdAt = data.createdAt.toDate();
        const updatedAt = data.updatedAt.toDate();
        return { ...data, createdAt, updatedAt };
      });
      return topics as TopicDTO[];
    }

    return [];
  }

  /**
   * 모든 추천 주제 반환
   * @description 비활성화된 값까지 모두 반환
   * @returns 모든 추천 주제 데이터 리스트
   */
  async findAllAdmin(): Promise<TopicDTO[] | []> {
    const topicDocs = await firestore().collection('topic').get();

    if (!topicDocs.empty) {
      const topics = topicDocs.docs.map((doc) => {
        const data = doc.data();

        const createdAt = data.createdAt.toDate();
        const updatedAt = data.updatedAt.toDate();
        return { ...data, createdAt, updatedAt };
      });
      return topics as TopicDTO[];
    }

    return [];
  }

  /**
   * id와 일치하는 추천 주제 반환
   * @param id 추천 주제(topic)의 id
   * @returns id와 일치하는 하나의 추천 주제 데이터
   */
  async findOne(id: number): Promise<TopicDTO | 'NOT_FOUND'> {
    const topicDoc = await firestore()
      .collection('topic')
      .doc(id.toString())
      .get();

    if (topicDoc.exists) {
      const data = topicDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as TopicDTO;
    }

    return 'NOT_FOUND';
  }

  /**
   * 추천 주제 마지막 번호 반환
   * @description 마지막 번호 기준으로 새로운 주제를 생성할때 주제의 id로 사용
   * @returns 주제 마지막 리스트 번호
   */
  async topicLastIndex(): Promise<number> {
    const topicDocs = await firestore().collection('topic').get();

    if (!topicDocs.empty) {
      const topics = topicDocs.docs.map((doc) => {
        return doc.data();
      });
      return topics.length;
    }

    return 0;
  }

  /**
   * 추천 주제 생성
   * @param createTopicDTO 주제 데이터
   * @param id 주제 id
   * @returns 생성된 추천 주제 데이터
   */
  async create(createTopicDTO: CreateTopicDTO, id: number): Promise<TopicDTO> {
    const topicDoc = firestore().collection('topic').doc(id.toString());

    const topicData = {
      id: id,
      title: createTopicDTO.title,
      category: createTopicDTO.category,
      content: createTopicDTO.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: true,
    };

    await topicDoc.set(topicData, { merge: true });

    return topicData;
  }

  /**
   * 추천 주제 업데이트
   * @param updateTopicDTO 업데이트할 데이터와 id
   * @returns 업데이트된 추천 주제 데이터
   */
  async update(
    updateTopicDTO: UpdateTopicDTO,
  ): Promise<TopicDTO | 'NOT_FOUND'> {
    const topicDoc = await firestore()
      .collection('topic')
      .doc(updateTopicDTO.id.toString())
      .get();

    if (!topicDoc.exists) {
      return 'NOT_FOUND';
    }

    const topicData = topicDoc.data();

    const updatedTopicData = {
      ...topicData,
      title: updateTopicDTO.title || topicData.title,
      category: updateTopicDTO.category || topicData.category,
      content: updateTopicDTO.content || topicData.content,
      status: updateTopicDTO.status ?? topicData.status,
      updatedAt: new Date(),
    };

    await topicDoc.ref.set(updatedTopicData, { merge: true });

    return updatedTopicData as TopicDTO;
  }
}
