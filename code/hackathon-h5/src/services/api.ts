import request from '@/utils/request/request.js';

export const loginApi = (data?: any) => {
  return request.post('/api/login', {
    data,
  });
};

export const updateApi = (data: {
  address: number;
  value: number;
  type: 1 | 2;
}) => {
  return request.post('/api/carbon/credit', {
    data,
  });
};

export const queryCarbonCredits = (data?: any) => {
  return request.get(`/api/carbon/credits/${data}`);
};

export const burnToken = (data?: any) => {
  return request.post(`/api/carbon/token/burn`, {
    data,
  });
};
