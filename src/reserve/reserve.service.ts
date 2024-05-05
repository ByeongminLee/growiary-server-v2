import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { ReserveRepository } from './reserve.repository';
import { CreateReserveDTO, ReserveDTO } from './reserve.dto';

@Injectable()
export class ReserveService {
  constructor(
    @Inject(REQUEST) private readonly request: { user: UserDTO },
    private readonly reserveRepository: ReserveRepository,
  ) {}

  async create(createReserveDTO: CreateReserveDTO): Promise<ReserveDTO> {
    const { uid } = this.request.user;
    return await this.reserveRepository.create({
      createReserveDTO,
      userId: uid,
    });
  }

  async findAll(): Promise<ReserveDTO[] | []> {
    return await this.reserveRepository.findAll();
  }

  async findAllUser(): Promise<ReserveDTO[] | []> {
    const { uid } = this.request.user;
    return await this.reserveRepository.findAllUser({ userId: uid });
  }
}
