import { Injectable } from '@nestjs/common';
import { CreateTopicDTO, TopicDTO, UpdateTopicDTO } from './topic.dto';
import { firestore } from 'firebase-admin';

@Injectable()
export class TopicRepository {
  constructor() {}

  async findAll(): Promise<TopicDTO[] | []> {
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

  async create(createTopicDTO: CreateTopicDTO, id: number): Promise<TopicDTO> {
    const topicDoc = firestore().collection('topic').doc(id.toString());

    const topicData = {
      id: id,
      title: createTopicDTO.title,
      icon: createTopicDTO.icon,
      content: createTopicDTO.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await topicDoc.set(topicData, { merge: true });

    return topicData;
  }

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
      icon: updateTopicDTO.icon || topicData.icon,
      content: updateTopicDTO.content || topicData.content,
      updatedAt: new Date(),
    };

    await topicDoc.ref.set(updatedTopicData, { merge: true });

    return updatedTopicData as TopicDTO;
  }
}
