import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TopicModule } from './topic/topic.module';
import { PostModule } from './post/post.module';
import * as admin from 'firebase-admin';
import config from './config';
import { JwtModule } from '@nestjs/jwt';
import { ReportModule } from './report/report.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET_ACCESS_KEY,
    }),
    AuthModule,
    UsersModule,
    TopicModule,
    PostModule,
    ReportModule,
  ],
})
export class AppModule {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
}
