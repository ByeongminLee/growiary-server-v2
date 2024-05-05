import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
import { CreateReserveDTO, ReserveDTO } from './reserve.dto';

@Injectable()
export class ReserveRepository {
  constructor() {}

  async create({
    createReserveDTO,
    userId,
  }: {
    createReserveDTO: CreateReserveDTO;
    userId: string;
  }): Promise<ReserveDTO> {
    const reserve = firestore().collection('reserve').doc(userId);

    const reserveId: string = await uuidv4();

    const reserveData = {
      [reserveId]: {
        ...createReserveDTO,
        id: reserveId,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    await reserve.set(reserveData, { merge: true });

    return Object.values(reserveData)[0];
  }

  async findAll(): Promise<ReserveDTO[] | []> {
    const reserveDocs = await firestore().collection('reserve').get();

    if (!reserveDocs.empty) {
      const reserves = reserveDocs.docs.map((doc) => {
        const data = doc.data();
        const reserves = Object.values(data).map((reserve) => {
          const createdAt = reserve.createdAt.toDate();
          const updatedAt = reserve.updatedAt.toDate();
          return { ...reserve, createdAt, updatedAt };
        });

        return reserves;
      });

      return reserves.flat() as ReserveDTO[];
    }

    return [];
  }

  async findAllUser({
    userId,
  }: {
    userId: string;
  }): Promise<ReserveDTO[] | []> {
    const reserveDocs = await firestore()
      .collection('reserve')
      .doc(userId)
      .get();

    if (reserveDocs.exists) {
      const postsOrdinal = reserveDocs.data();
      const reserves = Object.values(postsOrdinal).map((reserve) => {
        const createdAt = reserve.createdAt.toDate();
        const updatedAt = reserve.updatedAt.toDate();
        return { ...reserve, createdAt, updatedAt };
      });

      return reserves as ReserveDTO[];
    }

    return [];
  }
}
