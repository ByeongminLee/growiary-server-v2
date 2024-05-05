import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { FeedbackRepository } from './feedback.repository';
import { CreateFeedbackDTO, FeedbackDTO } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly feedbackRepository: FeedbackRepository,
  ) {}

  async create(createFeedbackDTO: CreateFeedbackDTO): Promise<FeedbackDTO> {
    const { uid } = this.request.user;
    return await this.feedbackRepository.create({
      createFeedbackDTO,
      userId: uid,
    });
  }

  async findAll(): Promise<FeedbackDTO[] | []> {
    return await this.feedbackRepository.findAll();
  }

  async findAllUser(): Promise<FeedbackDTO[] | []> {
    const { uid } = this.request.user;
    return await this.feedbackRepository.findAllUser({ userId: uid });
  }
}
