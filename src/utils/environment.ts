import config from 'src/config';

export const getClientUrl = () => {
  const env = process.env.FUNCTION_TARGET;

  if (env === 'local') {
    return config.CLIENT_URL_LOCAL;
  } else if (env === 'dev') {
    return config.CLIENT_URL_DEV;
  } else if (env === 'api') {
    return config.CLIENT_URL_PRODUCT;
  }
};
