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
        userId: userId,
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
          const userId = doc.id;
          return { ...post, userId, createdAt, updatedAt };
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

  /**
   * 오늘 날짜로부터 count되는 날짜까지의 게시글의 작성되었는지 여부를 반환
   * @description 날짜는 writeDate 기준으로 반환
   * @description 인덱스 0부터 오늘날짜이며 count가 5라면 5일전까지의 게시글 작성이 되엇는지 여부를 반환
   * @param userId 유저 아이디
   * @param count 반환할 날짜 수
   * @returns boolean[]
   */
  async lastPost({
    userId,
    count,
  }: {
    userId: string;
    count: number;
  }): Promise<boolean[]> {
    const posts = (await this.findAllUser({ userId })) as PostDTO[];

    const today = new Date();
    const lastDates = Array.from({ length: count }, (_, index) => {
      const date = new Date();
      date.setDate(today.getDate() - index);
      return date;
    });

    const lastPosts = lastDates.map((date) => {
      const writeDate = date.toISOString().split('T')[0];

      return posts.some(
        (post) =>
          new Date(post.writeDate).toISOString().split('T')[0] === writeDate,
      );
    });

    return lastPosts;
  }

  /**
   * 연속하게 작성된 게시글 수 반환
   * @description 오늘 날짜로부터 post의 writeDate 기준으로 연속되게 작성된 게시글 수 반환
   * @param userId 유저 아이디
   * @returns 연속되게 작성된 게시글 수
   */
  async continueRangePost({ userId }: { userId: string }): Promise<number> {
    const posts = (await this.findAllUser({ userId })) as PostDTO[];

    posts.sort((a, b) => (a.writeDate > b.writeDate ? -1 : 1));

    let count = 0;
    const currentDate = new Date();

    for (const post of posts) {
      const postDate = new Date(post.writeDate);

      // 현재 날짜와 게시글 작성일이 연속되는지 확인
      if (
        postDate.getFullYear() === currentDate.getFullYear() &&
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getDate() === currentDate.getDate()
      ) {
        count++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return count;
  }
}
