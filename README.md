# Fetch axios Client Library

This TypeScript/JavaScript library provides a flexible and extensible HTTP client for making requests. It supports common HTTP methods, allows for the customization of requests and responses through interceptors, and is designed for ease of use.

## Installation

To install the library in your project, use npm:

```bash
yarn add @rdev06/fetch-axios
```

## Usage

Below is a quick guide on how to use the HTTP client library in your TypeScript or JavaScript project.

### Importing the Library

```typescript
import axios, { IHttpOption, IHttpClientResponse } from '@rdev06/fetch-axios';
```

### Adding Interceptors

Interceptors can be added to customize requests and responses. For example, you can add a request interceptor to modify headers:

```typescript
const requestInterceptor: IRequestInterceptor = {
    onRequest: async (request: Request): Promise<Request> => {
        // Modify request or add headers here
        return request;
    }
};

axios.addRequestInterceptor(requestInterceptor);
```

### Making Requests

```typescript
// Make a GET request
const getResponse = await axios.get('https://api.example.com/data', { responseType: 'json' });
console.log(getResponse.data);

// Make a POST request
const postData = { key: 'value' };
const postResponse = await axios.post('https://api.example.com/post', postData, { responseType: 'json' });
console.log(postResponse.data);
```

### Adding Response Interceptors

You can add response interceptors to handle or modify responses:

```typescript
const responseInterceptor: IResponseInterceptor = {
    onResponse: async (response: IHttpClientResponse): Promise<IHttpClientResponse> => {
        // Modify response or handle errors here
        return response;
    }
};

axios.addResponseInterceptor(responseInterceptor);
```

## API Reference

### `httpClient`

The default export is a function that creates and returns an instance of the `IHttpClient` interface. It can be used to make various HTTP requests.

### `IHttpOption`

An interface extending `RequestInit` with an additional property `responseType` to specify the desired response type.

### `IHttpClientResponse`

An interface extending the native `Response` object with an additional property `data` containing the parsed response body.

### `IRequestInterceptor` and `IResponseInterceptor`

Interfaces for defining request and response interceptors that can modify or handle requests and responses.

### `IHttpClient`

An interface representing the HTTP client with methods for making different types of requests and adding request and response interceptors.

### `HttpClient` Class

An implementation of the `IHttpClient` interface providing the core functionality of the HTTP client.

## Contributing

Feel free to contribute to the development of this HTTP client library by submitting issues or pull requests on the [GitHub repository](https://github.com/vikasyadavd/http-client.git).

## License

This library is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.