import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
import { CreateFeedbackDTO, FeedbackDTO } from './feedback.dto';

@Injectable()
export class FeedbackRepository {
  constructor() {}

  async create({
    createFeedbackDTO,
    userId,
  }: {
    createFeedbackDTO: CreateFeedbackDTO;
    userId: string;
  }): Promise<FeedbackDTO> {
    const feedback = firestore().collection('feedback').doc(userId);

    const feedbackId: string = await uuidv4();

    const feedbackData = {
      [feedbackId]: {
        ...createFeedbackDTO,
        id: feedbackId,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    await feedback.set(feedbackData, { merge: true });

    return Object.values(feedbackData)[0];
  }

  async findAll(): Promise<FeedbackDTO[] | []> {
    const feedbackDocs = await firestore().collection('feedback').get();

    if (!feedbackDocs.empty) {
      const feedbacks = feedbackDocs.docs.map((doc) => {
        const data = doc.data();
        const feedbacks = Object.values(data).map((feedback) => {
          const createdAt = feedback.createdAt.toDate();
          const updatedAt = feedback.updatedAt.toDate();
          return { ...feedback, createdAt, updatedAt };
        });

        return feedbacks;
      });

      return feedbacks.flat() as FeedbackDTO[];
    }

    return [];
  }

  async findAllUser({
    userId,
  }: {
    userId: string;
  }): Promise<FeedbackDTO[] | []> {
    const feedbackDocs = await firestore()
      .collection('feedback')
      .doc(userId)
      .get();

    if (feedbackDocs.exists) {
      const postsOrdinal = feedbackDocs.data();
      const feedbacks = Object.values(postsOrdinal).map((feedback) => {
        const createdAt = feedback.createdAt.toDate();
        const updatedAt = feedback.updatedAt.toDate();
        return { ...feedback, createdAt, updatedAt };
      });

      return feedbacks as FeedbackDTO[];
    }

    return [];
  }
}
