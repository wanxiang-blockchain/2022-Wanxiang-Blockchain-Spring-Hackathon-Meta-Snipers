export const API_PREFIX = '';
export const TIME_OUT = 10000;
export const SUCCESS_CODE = 200;
export const LOGIN_EXPIRE_CODE = '000207';
export const HTTP_CODE_MESSAGE = {
  200: 'The server successfully returned the requested data.',
  // 201:'Data is created or modified successfully. ',
  // 202:'',
  // 204:'Deleting data Succeeded',
  400: 'There was an error in the request,',
  401: 'User does not have permission (wrong token, username, password).',
  403: 'The user is authorized, but access is prohibited',
  404: 'The request was made for a nonexistent record, and the server did not act on it',
  406: 'The requested format is not available',
  410: 'The requested resource is permanently deleted and will not be retrieved',
  422: 'A validation error occurred while creating an object',
  500: 'An error occurred on the server. Check the server.',
  502: 'Bad gateway.',
  503: 'The service is unavailable, the server is temporarily overloaded or maintained.',
  504: 'Gateway timeout.',
};
