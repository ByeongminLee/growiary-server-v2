import { Inject, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { CreateProfileDTO } from './profile.dto';
import { REQUEST } from '@nestjs/core';
import { UserDTO } from 'src/users/users.dto';
import { BadgeKeyName } from 'src/challenge/challenge.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    @Inject(REQUEST) private readonly request: { user: UserDTO },
  ) {}

  async createProfile(createProfileDTO: CreateProfileDTO) {
    const profile = this.getProfile();

    if (!profile) {
      return this.profileRepository.create(createProfileDTO);
    }

    return 'Already_Exists';
  }

  async getProfile() {
    const userId = this.request.user.uid;

    return await this.profileRepository.getProfile(userId);
  }

  async profileTitleBadge(titleBadge: BadgeKeyName) {
    const userId = this.request.user.uid;

    return await this.profileRepository.updateTitleBadge(userId, titleBadge);
  }
}
