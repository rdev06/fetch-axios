import { IHttpClient, IHttpClientResponse, IRequest } from './fetchAxios';
type TAxios = ((options: IRequest) => Promise<IHttpClientResponse>) & IHttpClient;
declare const axios: TAxios;
export default axios;
