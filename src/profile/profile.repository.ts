import { Injectable } from '@nestjs/common';
import { CreateProfileDTO, ProfileDTO } from './profile.dto';
import { firestore, storage } from 'firebase-admin';
import * as fs from 'fs';
import axios from 'axios';
import { UsersRepository } from 'src/users/users.repository';
import { BadgeKeyName } from 'src/challenge/challenge.dto';
import toDate from 'src/utils/date';

@Injectable()
export class ProfileRepository {
  constructor(private readonly usesRepository: UsersRepository) {}

  async create(createProfileDTO: CreateProfileDTO) {
    const ProfileDoc = await firestore()
      .collection('profile')
      .doc(createProfileDTO.userId);

    // const imageFile = await this.downloadImage(createProfileDTO.profileImage);

    // const profileImage = await this.uploadProfileImage(
    //   createProfileDTO.userId,
    //   imageFile,
    // );

    const profile = {
      ...createProfileDTO,
      // profileImage: profileImage || '',
      titleBadge: 'first',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ProfileDoc.set(profile, { merge: true });

    // await this.deleteImage(imageFile);

    return profile;
  }

  async updateTitleBadge(userId: string, titleBadge: BadgeKeyName) {
    const profileDoc = await firestore().collection('profile').doc(userId);

    await profileDoc.update({
      titleBadge,
      updatedAt: new Date(),
    });

    return titleBadge;
  }

  async getProfile(userId: string): Promise<ProfileDTO> {
    const profileDoc = await firestore()
      .collection('profile')
      .doc(userId)
      .get();

    if (!profileDoc.exists) {
      return undefined;
    }
    const profile = profileDoc.data() as ProfileDTO;

    return {
      ...profile,
      createdAt: toDate(profile.createdAt),
      updatedAt: toDate(profile.updatedAt),
    };
  }

  async uploadProfileImage(userId: string, uploadImage: string) {
    const bucket = storage().bucket();

    const uniqueFileName = `${userId}+${Date.now()}_${Math.floor(Math.random() * 10000)}.png`;

    await bucket.upload(uploadImage, {
      destination: uniqueFileName,
      contentType: 'image/png',
    });

    const url = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
    return url;
  }

  async downloadImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = 'image.png';

    await fs.promises.writeFile(filePath, response.data);

    return filePath;
  }

  async deleteImage(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
