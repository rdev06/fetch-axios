import { IHttpClientResponse, IRequest } from './fetchAxios';
declare const axios: (options: IRequest) => Promise<IHttpClientResponse>;
export default axios;
