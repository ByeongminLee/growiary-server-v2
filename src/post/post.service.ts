import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDTO, UpdatePostDTO } from './post.dto';
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
}
