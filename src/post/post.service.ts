import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDTO, PostDTO, UpdatePostDTO } from './post.dto';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(REQUEST) private readonly request: { user: UserDTO },
  ) {}

  async createPost(createPostDTO: CreatePostDTO) {
    const uid = this.request.user.uid;
    return await this.postRepository.create({ createPostDTO, userId: uid });
  }

  /**
   * 전체 유저 post 반환
   * @returns 전체 유저 post 리스트
   */
  async findAllPost() {
    return await this.postRepository.findAll();
  }

  /**
   * 특정 유저의 post 반환
   * @returns 전체 유저 post 리스트
   */
  async findUserAllPost() {
    const uid = this.request.user.uid;

    return await this.postRepository.findAllUser({ userId: uid });
  }

  async findOnePost(postId: string) {
    const uid = this.request.user.uid;

    return await this.postRepository.findOne({ userId: uid, postId });
  }

  async updatePost(updatePostDTO: UpdatePostDTO) {
    const uid = this.request.user.uid;

    return await this.postRepository.update({ updatePostDTO, userId: uid });
  }

  /**
   * 주가 post 반환
   * @description 이번주에 작선된 post의 수를 요일별로 반환
   * @description 0: 일요일, 1: 월요일, 2: 화요일, 3: 수요일, 4: 목요일, 5: 금요일, 6: 토요일
   * @returns
   */
  async weeklyPost() {
    const uid = this.request.user.uid;
    const posts: PostDTO[] = await this.postRepository.findAllUser({
      userId: uid,
    });

    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setDate(today.getDate() + (6 - day));
    end.setHours(23, 59, 59, 999);

    const weeklyPosts = posts.filter(
      (post) =>
        new Date(post.writeDate) >= start && new Date(post.writeDate) <= end,
    );

    const weekly = Array(7).fill(0);
    weeklyPosts.forEach((post) => {
      const day = new Date(post.writeDate).getDay();
      weekly[day] += 1;
    });

    return weekly;
  }
}
