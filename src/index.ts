import FetchAxios, { IHttpClientResponse, IRequest } from './fetchAxios';

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

const instance = new FetchAxios();
const axios: (options: IRequest) => Promise<IHttpClientResponse> = FetchAxios.prototype.request.bind(instance);
extend(axios, FetchAxios.prototype, instance);
extend(axios, instance, null);

export default axios;