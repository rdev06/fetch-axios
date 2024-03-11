import FetchAxios, { HTTP_RESPONSE_TYPE, IRequest } from './fetchAxios';
const axios = new FetchAxios();

global.fetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify({ data: 'mocked response' }), { status: 200 })));

describe('HttpClient', () => {
  let mockRequestInterceptor: jest.Mock;
  let mockResponseInterceptor: jest.Mock;

  beforeEach(() => {
    mockRequestInterceptor = jest.fn(() => ({}));
    mockResponseInterceptor = jest.fn(()=>({data:{data: 'mocked response'}}));
  });

  it('should make a GET request successfully', async () => {
    axios.interceptors.request.use(mockRequestInterceptor);
    axios.interceptors.response.use(mockResponseInterceptor);

    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');

    expect(response.data).toEqual({"data": "mocked response"});
  });

  it('should make a GET request from .request method', async () => {
    const option: IRequest = {
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      method: 'GET',
      responseType: HTTP_RESPONSE_TYPE.json,
    };
    const response = await axios.request(option);
    expect(response.data).toEqual({"data": "mocked response"});
  })

  it('should add and call request interceptors', async () => {
    const mockInterceptor = jest.spyOn(axios.interceptors.request, 'use');

    axios.interceptors.request.use(mockRequestInterceptor);

    await axios.get('https://jsonplaceholder.typicode.com/todos/2', { responseType: HTTP_RESPONSE_TYPE.json });

    expect(mockInterceptor).toHaveBeenCalled();
  });

  it('should add and call response interceptors', async () => {
    const mockInterceptor = jest.spyOn(axios.interceptors.response, 'use');

    axios.interceptors.response.use(mockResponseInterceptor);

    await axios.get('https://jsonplaceholder.typicode.com/todos/2', { responseType: HTTP_RESPONSE_TYPE.json });

    expect(mockInterceptor).toHaveBeenCalled();
  });
});
