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
  stream = 'stream',
  json = 'json',
  blob = 'blob',
  formData = 'formData',
  text = 'text'
}

export interface IHttpOption<T = any> extends Omit<RequestInit, 'body'> {
  responseType: HTTP_RESPONSE_TYPE;
  responseDataType?: T;
  dispatcher?: any;
}

export interface IRequest<T = any> extends IHttpOption {
  url: RequestInfo;
  data?: RequestInit['body'];
}

export interface IHttpClientResponse<T = any> extends Response {
  data: T;
}

export type InterceptRequest = RequestInit & { url?: RequestInfo };

export type CallBackFn = (interceptdata: InterceptRequest) => InterceptRequest | Promise<InterceptRequest> | void;

export interface IHttpClient {
  get<T = any>(url: RequestInfo, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  post<T = any>(url: RequestInfo, body: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  patch<T = any>(url: RequestInfo, body: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  put<T = any>(url: RequestInfo, body: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  delete<T = any>(url: RequestInfo, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
  request<T = any>(options: IRequest<T>): Promise<IHttpClientResponse<T>>;
  interceptors: {
    request: { use: (interceptor: CallBackFn) => void };
    response: { use: (interceptor: CallBackFn) => void };
  };
}

export default class FetchAxios implements IHttpClient {
  private requestInterceptors: CallBackFn[] = [];
  private responseInterceptors: CallBackFn[] = [];
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

  private async processRequest(url: RequestInfo, init: InterceptRequest): Promise<Request> {
    init.url = url;
    for (const interceptor of this.requestInterceptors) {
      const newRequest = await interceptor(init);
      if (!!newRequest && 'url' in newRequest) {
        Object.assign(init, newRequest);
      }
    }

    if (
      !!init.body &&
      !(init.body instanceof Buffer || init.body instanceof ReadableStream) &&
      typeof init.body === 'object' &&
      (!init.headers || !init.headers['Content-Type'] || init.headers['Content-Type'] === 'application/json')
    ) {
      if (!init.headers) init.headers = {};
      if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(init.body);
    } else if (!!init.headers) {
      delete init.headers['Content-Type'];
    }
    return new Request(init.url, init);
  }

  private async processResponse<T>(
    request: RequestInit,
    response: Response & { data?: any },
    options?: IHttpOption<T>
  ): Promise<IHttpClientResponse<T>> {
    let data: any = null;
    if (response.ok) {
      if (options?.responseType) {
        if (options.responseType === HTTP_RESPONSE_TYPE.arraybuffer) {
          data = Buffer.from(await response.arrayBuffer());
        } else if (options.responseType === HTTP_RESPONSE_TYPE.stream) {
          data = response.body;
        } else {
          data = await response[options.responseType]();
        }
      } else {
        data = await this.handelUnknownResponse(response);
      }
    } else {
      data = response.data || (await this.handelUnknownResponse(response));
    }
    let toReturn: IHttpClientResponse<T> | any = {
      data,
      headers: response.headers,
      ok: response.ok,
      status: response.status,
      config: { ...request },
      statusText: response.statusText
    };
    for (const toDel of ['body', 'headers', 'method', 'url']) {
      delete toReturn.config[toDel];
    }

    for (const interceptor of this.responseInterceptors) {
      toReturn = await interceptor(toReturn);
    }
    if (!response.ok) {
      throw { response: toReturn, message: toReturn.statusText || 'Internal Server Error' };
    }
    return toReturn;
  }

  private async handelUnknownResponse(response: Response) {
    let text = null;
    try {
      text = await response.text();
      text = JSON.parse(text);
    } catch (e) {
      // do nothing
    }
    return text;
  }

  private async performFetch<T>(
    url: RequestInfo,
    options: IHttpOption<T> = { responseType: HTTP_RESPONSE_TYPE.json },
    method?: HTTP_METHOD,
    data?: any
  ): Promise<IHttpClientResponse<T>> {
    options = { ...options }; // deep copy
    const init: RequestInit & { data?: RequestInit['body'] } = Object.assign(options, { body: data });
    delete init.data;
    if (method) {
      init.method = method;
    }
    if (!init.headers) {
      init.headers = {};
    }
    try {
      const request = await this.processRequest(url, init);
      const response: any = await fetch(request);
      return this.processResponse<T>(init, response, options);
    } catch (error) {
      return this.processResponse(
        init,
        {
          ok: false,
          //@ts-ignore
          headers: [],
          status: 500,
          statusText: 'Error',
          data: {
            message: error.message,
            name: error.name,
            code: error.code || error.cause.code,
            path: error.path
          }
        },
        options
      ) as unknown as IHttpClientResponse<T>;
    }
  }

  public async get<T = any>(url: RequestInfo, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.GET);
  }

  public async post<T = any>(url: RequestInfo, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.POST, data);
  }

  public async patch<T = any>(url: RequestInfo, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.PATCH, data);
  }

  public async put<T = any>(url: RequestInfo, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.PUT, data);
  }

  public async delete<T = any>(url: RequestInfo, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(url, options, HTTP_METHOD.DELETE, data);
  }

  public async request<T = any>(options: IRequest<T>): Promise<IHttpClientResponse<T>> {
    return this.performFetch(options.url, options, options.method as HTTP_METHOD, options.data);
  }
}
