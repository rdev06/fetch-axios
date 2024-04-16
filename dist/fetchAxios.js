// src/fetchAxios.ts
var HTTP_METHOD;
(function(HTTP_METHOD2) {
  HTTP_METHOD2["POST"] = "POST";
  HTTP_METHOD2["GET"] = "GET";
  HTTP_METHOD2["PATCH"] = "PATCH";
  HTTP_METHOD2["PUT"] = "PUT";
  HTTP_METHOD2["DELETE"] = "DELETE";
})(HTTP_METHOD || (HTTP_METHOD = {}));
var HTTP_RESPONSE_TYPE;
(function(HTTP_RESPONSE_TYPE2) {
  HTTP_RESPONSE_TYPE2["arrayBuffer"] = "arrayBuffer";
  HTTP_RESPONSE_TYPE2["arraybuffer"] = "arraybuffer";
  HTTP_RESPONSE_TYPE2["stream"] = "stream";
  HTTP_RESPONSE_TYPE2["json"] = "json";
  HTTP_RESPONSE_TYPE2["blob"] = "blob";
  HTTP_RESPONSE_TYPE2["formData"] = "formData";
  HTTP_RESPONSE_TYPE2["text"] = "text";
})(HTTP_RESPONSE_TYPE || (HTTP_RESPONSE_TYPE = {}));

class FetchAxios {
  requestInterceptors = [];
  responseInterceptors = [];
  reqConfig = {};
  interceptors = {
    request: {
      use: (interceptor) => {
        this.requestInterceptors.push(interceptor);
      }
    },
    response: {
      use: (interceptor) => {
        this.responseInterceptors.push(interceptor);
      }
    }
  };
  async processRequest(request) {
    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request);
    }
    const configKeys = Object.keys(request);
    for (const k of configKeys) {
      this.reqConfig[k] = request[k];
    }
    return request;
  }
  async processResponse(response, options) {
    let data = null;
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
    let toReturn = {
      data,
      headers: {},
      ok: response.ok,
      status: response.status,
      config: this.reqConfig,
      statusText: response.statusText
    };
    response.headers.forEach((value, name) => {
      toReturn.headers[name] = value;
    });
    for (const interceptor of this.responseInterceptors) {
      toReturn = await interceptor(toReturn);
    }
    if (!response.ok) {
      toReturn.data = response.data || await this.handelUnknownResponse(response);
      throw { response: toReturn, message: toReturn.statusText || "Internal Server Error" };
    }
    return toReturn;
  }
  async handelUnknownResponse(response) {
    let text = await response.text();
    try {
      text = JSON.parse(text);
    } catch (e) {
    }
    return text;
  }
  async performFetch(url, options = { responseType: HTTP_RESPONSE_TYPE.json }, method, data) {
    const init = Object.assign(options, { body: data });
    if (method) {
      init.method = method;
    }
    if (!init.headers) {
      init.headers = {};
    }
    if (typeof data === "object" || options.headers?.["Content-Type"] === "application/json") {
      options.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(data);
    }
    const request = new Request(url, init);
    const processedRequest = await this.processRequest(request);
    try {
      const response = await fetch(processedRequest, options);
      return this.processResponse(response, options);
    } catch (error) {
      return this.processResponse({
        ok: false,
        headers: [],
        status: 500,
        statusText: "Error",
        data: {
          message: error.message,
          name: error.name,
          code: error.code,
          path: error.path
        }
      }, options);
    }
  }
  async get(url, options) {
    return this.performFetch(url, options, HTTP_METHOD.GET);
  }
  async post(url, data, options) {
    return this.performFetch(url, options, HTTP_METHOD.POST, data);
  }
  async patch(url, data, options) {
    return this.performFetch(url, options, HTTP_METHOD.PATCH, data);
  }
  async put(url, data, options) {
    return this.performFetch(url, options, HTTP_METHOD.PUT, data);
  }
  async delete(url, data, options) {
    return this.performFetch(url, options, HTTP_METHOD.DELETE, data);
  }
  async request(options) {
    return this.performFetch(options.url, options, options.method, options.data);
  }
}
export {
  FetchAxios as default,
  HTTP_RESPONSE_TYPE,
  HTTP_METHOD
};

export { FetchAxios };
