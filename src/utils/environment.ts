import { Request } from 'express';
import config from 'src/config';

export const getEnvironment = (req: Request): 'LOCAL' | 'DEV' | 'PRODUCT' => {
  const host = req.headers.host;
  let env;
  if (host.includes('localhost')) {
    env = 'LOCAL';
  } else if (host.includes('dev-growiary-web')) {
    env = 'DEV';
  } else {
    env = 'PRODUCT';
  }
  return env;
};

export const getClientUrl = (req: Request) => {
  const env = getEnvironment(req);

  if (env === 'LOCAL') {
    return config.CLIENT_URL_LOCAL;
  } else if (env === 'DEV') {
    return config.CLIENT_URL_DEV;
  } else if (env === 'PRODUCT') {
    return config.CLIENT_URL_PRODUCT;
  }
};
