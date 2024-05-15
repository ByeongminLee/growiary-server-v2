import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const server: express.Express = express();
export const createNestServer = async (expressInstance: express.Express) => {
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    {},
  );
  app.enableCors({
    origin: true,
    credentials: true,
    // origin: [
    //   'https://growiary-web.vercel.app',
    //   'https://dev-growiary-web.vercel.app',
    //   'http://localhost:3000',
    //   'https://localhost:3000',
    //   'https://growiary-admin-v2.vercel.app',
    //   'https://growiary.com',
    // ],
  });
  app.use(cookieParser());
  return app.init();
};
createNestServer(server)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

export const api: functions.HttpsFunction = functions
  .region('asia-northeast3')
  .https.onRequest(server);
export const dev: functions.HttpsFunction = functions
  .region('asia-northeast3')
  .https.onRequest(server);
export const local: functions.HttpsFunction = functions
  .region('asia-northeast3')
  .https.onRequest(server);
