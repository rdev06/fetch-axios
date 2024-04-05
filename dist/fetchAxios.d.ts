export declare const enum HTTP_METHOD {
    POST = "POST",
    GET = "GET",
    PATCH = "PATCH",
    PUT = "PUT",
    DELETE = "DELETE"
}
export declare const enum HTTP_RESPONSE_TYPE {
    arrayBuffer = "arrayBuffer",
    arraybuffer = "arraybuffer",
    stream = "stream",
    json = "json",
    blob = "blob",
    formData = "formData",
    text = "text"
}
export interface IHttpOption<T = any> extends Omit<RequestInit, 'body'> {
    responseType: HTTP_RESPONSE_TYPE;
    responseDataType?: T;
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
        request: {
            use: (interceptor: CallBackFn) => void;
        };
        response: {
            use: (interceptor: CallBackFn) => void;
        };
    };
}
export default class FetchAxios implements IHttpClient {
    private requestInterceptors;
    private responseInterceptors;
    private reqConfig;
    interceptors: {
        request: {
            use: (interceptor: CallBackFn) => void;
        };
        response: {
            use: (interceptor: CallBackFn) => void;
        };
    };
    private processRequest;
    private processResponse;
    private handelUnknownResponse;
    private performFetch;
    get<T = any>(url: RequestInfo | URL, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
    post<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
    patch<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
    put<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
    delete<T = any>(url: RequestInfo | URL, data: any, options?: IHttpOption<T>): Promise<IHttpClientResponse<T>>;
    request<T = any>(options: IRequest<T>): Promise<IHttpClientResponse<T>>;
}
