import { Injectable } from '@nestjs/common';
import { CreatePostDTO, PostDTO, UpdatePostDTO } from './post.dto';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class PostRepository {
  constructor() {}

  /**
   * 게시글 생성
   * @param createPostDTO 게시글 생성 DTO
   * @param userId 유저 아이디
   * @returns 생성된 게시글 데이터
   */
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

  /**
   * 모든 게시글 반환
   * @returns 모든 게시글 데이터 리스트
   */
  async findAll(): Promise<PostDTO[] | []> {
    const postDocs = await firestore().collection('post').get();

    if (!postDocs.empty) {
      const posts = postDocs.docs.map((doc) => {
        const data = doc.data();
        const posts = Object.values(data).map((post) => {
          const createdAt = post.createdAt.toDate();
          const updatedAt = post.updatedAt.toDate();
          return { ...post, createdAt, updatedAt };
        });

        return posts;
      });

      return posts.flat() as PostDTO[];
    }

    return [];
  }

  /**
   * 유저의 모든 게시글 반환
   * @param userId 유저 아이디
   * @returns 유저의 모든 게시글 데이터 리스트
   */
  async findAllUser({ userId }: { userId: string }): Promise<PostDTO[] | []> {
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

  /**
   * 유저의 게시글 하나 반환
   * @param userId 유저 아이디
   * @param postId 게시글 아이디
   * @returns 하나의 게시글 데이터
   */
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

  /**
   * 게시글 업데이트
   * @param updatePostDTO 게시글 업데이트 DTO
   * @param userId 유저 아이디
   * @returns 업데이트된 게시글 데이터
   */
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
