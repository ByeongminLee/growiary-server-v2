import { Injectable } from '@nestjs/common';
import { CreatePostDTO, PostDTO, UpdatePostDTO } from './post.dto';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class PostRepository {
  constructor() {}

  async create({
    createPostDTO,
    userId,
  }: {
    createPostDTO: CreatePostDTO;
    userId: string;
  }): Promise<{ [id: string]: PostDTO }> {
    const uid = uuidv4();

    const post = firestore().collection('post').doc(userId);

    const postData = {
      [uid]: {
        ...createPostDTO,
        id: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    await post.set(postData, { merge: true });
    return postData;
  }

  async findAll({ userId }: { userId: string }): Promise<PostDTO[] | []> {
    const postDocs = await firestore().collection('post').doc(userId).get();
    if (postDocs.exists) {
      const postsOrdinal = postDocs.data();
      const posts = Object.values(postsOrdinal).map((post) => {
        const createdAt = post.createdAt.toDate();
        const updatedAt = post.updatedAt.toDate();
        return { ...post, createdAt, updatedAt };
      });

      return posts as PostDTO[];
    }

    return [];
  }

  async findOne({
    userId,
    postId,
  }: {
    userId: string;
    postId: string;
  }): Promise<PostDTO | 'NOT_FOUND'> {
    const postDocs = await firestore().collection('post').doc(userId).get();

    if (!postDocs.exists) {
      return 'NOT_FOUND';
    }

    const postOrdinal = postDocs.data();
    const post = postOrdinal[postId];

    if (!post) {
      return 'NOT_FOUND';
    }

    const createdAt = post.createdAt.toDate();
    const updatedAt = post.updatedAt.toDate();

    return { ...post, createdAt, updatedAt } as PostDTO;
  }

  async update({
    updatePostDTO,
    userId,
  }: {
    updatePostDTO: UpdatePostDTO;
    userId: string;
  }): Promise<PostDTO | 'NOT_FOUND'> {
    const postDoc = await firestore().collection('post').doc(userId).get();

    if (!postDoc.exists) {
      return 'NOT_FOUND';
    }

    const postOrdinal = postDoc.data();
    const post: PostDTO = postOrdinal[updatePostDTO.id];

    if (!post) {
      return 'NOT_FOUND';
    }

    const updateData = {
      ...post,
      ...updatePostDTO,
      updatedAt: new Date(),
    };

    const postData = {
      ...postOrdinal,
      [updatePostDTO.id]: updateData,
    };

    await postDoc.ref.set(postData, { merge: true });

    if (updateData.createdAt instanceof Timestamp) {
      updateData.createdAt = updateData.createdAt.toDate();
    }

    return updateData;
  }
}
