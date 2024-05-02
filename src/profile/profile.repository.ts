import { Injectable } from '@nestjs/common';
import { CreateProfileDTO } from './profile.dto';
import { firestore, storage } from 'firebase-admin';
import * as fs from 'fs';
import axios from 'axios';
import { UsersRepository } from 'src/users/users.repository';

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ProfileDoc.set(profile, { merge: true });

    // await this.deleteImage(imageFile);

    return profile;
  }

  async getProfile(userId: string) {
    const user = await this.usesRepository.getUser({
      userId,
    });

    if (!user) {
      return undefined;
    }

    const profileDoc = await firestore()
      .collection('profile')
      .doc(user.uid)
      .get();

    if (!profileDoc.exists) {
      return undefined;
    }
    const profile = profileDoc.data();

    return {
      ...profile,
      createdAt: profile.createdAt.toDate(),
      updatedAt: profile.updatedAt.toDate(),
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
