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

  async findAllPost() {
    const uid = this.request.user.uid;

    return await this.postRepository.findAll({ userId: uid });
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
