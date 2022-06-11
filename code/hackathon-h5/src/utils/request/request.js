import { extend } from 'umi-request';
import { Toast } from 'antd-mobile';
import {
  API_PREFIX,
  SUCCESS_CODE,
  TIME_OUT,
  HTTP_CODE_MESSAGE,
} from './config';

const errorHandler = async (error) => {
  const response = error.response;
  if (response && response.status) {
    const data = await response.clone().json();

    if (data) {
      Toast.show({
        content: data.msg,
      });

      return {
        error: {
          status: response.status,
          code: data.code,
          msg: data.msg,
        },
      };
    } else {
      Toast.show({
        content: HTTP_CODE_MESSAGE[response.status],
      });
      return {
        error: {
          status: response.status,
        },
      };
    }
  } else {
    Toast.show({
      content: 'Your network is abnormal and you cannot connect to the server',
    });
    return { error };
  }
};

const client = extend({
  errorHandler: errorHandler,
  prefix: API_PREFIX,
  timeout: TIME_OUT,
  credentials: 'include',
});

// Same as the last one
client.interceptors.request.use(
  (url, options) => {
    const token = localStorage.getItem('SESSION_TOKEN');
    console.log(token);
    options.headers = { ...options.headers, 'Authorization-Token': token };
    return {
      url,
      options: { ...options, interceptors: true },
    };
  },
  { global: true },
);

client.interceptors.response.use(async (response) => {
  try {
    const { code, msg, data } = await response.clone().json();
    console.log(code, data);
    if (code === SUCCESS_CODE) {
      return Promise.resolve({ data });
    } else {
      return Promise.reject({ response });
    }
  } catch (error) {
    return Promise.reject(error);
  }
});

export default {
  get: (url, otherOptions = {}) => {
    return client.get(url, { ...otherOptions });
  },
  post: (url, otherOptions = {}) => {
    return client.post(url, { ...otherOptions });
  },
};
