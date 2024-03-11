import FetchAxios, { IHttpClient, IHttpClientResponse, IRequest } from './fetchAxios';

const extend = (a: any, b: any, thisArg: any) => {
  const keys = Object.getOwnPropertyNames(b);
  keys.forEach((key) => {
    if (key === 'constructor') {
      return;
    }
    if (thisArg) {
      a[key] = b[key].bind(thisArg);
    } else {
      a[key] = b[key];
    }
  });
  return a;
};

type TAxios = ((options: IRequest) => Promise<IHttpClientResponse>) & IHttpClient;

const instance = new FetchAxios();
const axios: TAxios = FetchAxios.prototype.request.bind(instance);
extend(axios, FetchAxios.prototype, instance);
extend(axios, instance, null);

export default axios;