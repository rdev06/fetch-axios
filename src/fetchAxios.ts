export const enum HTTP_METHOD {
  POST = 'POST',
  GET = 'GET',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export const enum HTTP_RESPONSE_TYPE {
  arrayBuffer = 'arrayBuffer',
  arraybuffer = 'arraybuffer',
  json = 'json',
  blob = 'blob',
  formData = 'formData',
  text = 'text'
}

export interface IHttpOption<T = any> extends Omit<RequestInit, 'body'> {
  responseType: HTTP_RESPONSE_TYPE;
  responseDataType?: T;
}

export interface IRequest<T = any> extends IHttpOption {
  url: RequestInfo | URL;
  data?: RequestInit['body']
}

export interface IHttpClientResponse<T = any> extends Response {
  data: T;
}

export type CallBackFn = (interceptdata: Request | IHttpClientResponse) => Object | Promise<Object>;

export interface IHttpClient {
  get<T = any>(url: RequestInfo | URL, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  post<T = any>(url: RequestInfo | URL, body: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  patch<T = any>(url: RequestInfo | URL, body: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  put<T = any>(url: RequestInfo | URL, body: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  delete<T = any>(url: RequestInfo | URL, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  request<T = any>(options: IRequest<T>): Promise<IHttpClientResponse<T>>;
  interceptors: {
    request: { use: (interceptor: CallBackFn) => void };
    response: { use: (interceptor: CallBackFn) => void };
  };
}

export default class FetchAxios implements IHttpClient {
  private requestInterceptors: CallBackFn[] = [];
  private responseInterceptors: CallBackFn[] = [];
  private reqConfig: any = {};
  public interceptors = {
    request: {
      use: (interceptor: CallBackFn) => {
        this.requestInterceptors.push(interceptor);
      }
    },
    response: {
      use: (interceptor: CallBackFn) => {
        this.responseInterceptors.push(interceptor);
      }
    }
  };

  private async processRequest(request: Request | any): Promise<Request> {
    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request);
    }
    const configKeys = Object.keys(request);
    for (const k of configKeys) {
        this.reqConfig[k] = request[k];
    }
    return request;
  }

  private async processResponse<T>(response: Response, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    let data: T | undefined | null = null;
    if (response.ok) {
      if (options?.responseType) {
        if(options.responseType === HTTP_RESPONSE_TYPE.arraybuffer){
          //@ts-ignore
          data = Buffer.from(await response.arrayBuffer())
        }else{
          data = await response[options.responseType]();
        }
      } else {
        data = await response.json();
      }
    }
    let toReturn: IHttpClientResponse<T> | any = { data, headers: {}, ok: response.ok, status: response.status, config: this.reqConfig, statusText: response.statusText };
    response.headers.forEach((value, name) => {
      toReturn.headers[name] = value;
    });
    for (const interceptor of this.responseInterceptors) {
      toReturn = await interceptor(toReturn);
    }
    return toReturn;
  }

  private async performFetch<T>(url: RequestInfo | URL, options?: IHttpOption<T>, method?: HTTP_METHOD, data?: any): Promise<IHttpClientResponse<T>> {
    const request = new Request(url, { ...(options || {}), method, body: data });
    const processedRequest = await this.processRequest(request);

    try {
      const response: any = await fetch(processedRequest);
      response.request = processedRequest;
      return this.processResponse<T>(response, options);
    } catch (error) {
      throw error;
    }
  }

  public async get<T = any>(url: RequestInfo | URL, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.GET);
  }

  public async post<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.POST, data);
  }

  public async patch<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.PATCH, data);
  }

  public async put<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.PUT, data);
  }

  public async delete<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.DELETE, data);
  }

  public async request<T = any>(options: IRequest<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(options.url, options, options.method as HTTP_METHOD, options.data);
  }
}