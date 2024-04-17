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
  dispatcher?: any
}

export interface IRequest<T = any> extends IHttpOption {
  url: RequestInfo | URL;
  data?: RequestInit['body'];
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

  private async processResponse<T>(response: Response & { data?: any }, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>> {
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
    }
    let toReturn: IHttpClientResponse<T> | any = {
      data,
      headers: response.headers,
      ok: response.ok,
      status: response.status,
      config: this.reqConfig,
      statusText: response.statusText
    };
    for (const interceptor of this.responseInterceptors) {
      toReturn = await interceptor(toReturn);
    }
    if (!response.ok) {
      toReturn.data = response.data || (await this.handelUnknownResponse(response));
      throw { response: toReturn, message: toReturn.statusText || 'Internal Server Error' };
    }
    return toReturn;
  }

  private async handelUnknownResponse(response: Response) {
    let text = await response.text();
    try {
      text = JSON.parse(text);
    } catch (e) {
      // do nothing
    }
    return text;
  }

  private async performFetch<T>(
    url: RequestInfo | URL,
    options: IHttpOption<T> = { responseType: HTTP_RESPONSE_TYPE.json },
    method?: HTTP_METHOD,
    data?: any
  ): Promise<IHttpClientResponse<T>> {
    const init: RequestInit = Object.assign(options, { body: data });
    if (method) {
      init.method = method;
    }
    if (!init.headers) {
      init.headers = {};
    }

    if (typeof data === 'object' || options.headers?.['Content-Type'] === 'application/json') {
      options.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(data);
    }

    const request = new Request(url, init);
    const processedRequest = await this.processRequest(request);

    try {
      const response: any = await fetch(processedRequest, options);
      return this.processResponse<T>(response, options);
    } catch (error) {
      return this.processResponse(
        {
          ok: false,
          //@ts-ignore
          headers: [],
          status: 500,
          statusText: 'Error',
          data: {
            message: error.message,
            name: error.name,
            code: error.code,
            path: error.path
          }
        },
        options
      ) as unknown as IHttpClientResponse<T>;
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
