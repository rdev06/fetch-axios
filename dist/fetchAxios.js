// src/fetchAxios.ts
var HTTP_METHOD;
((HTTP_METHOD2) => {
  HTTP_METHOD2["POST"] = "POST";
  HTTP_METHOD2["GET"] = "GET";
  HTTP_METHOD2["PATCH"] = "PATCH";
  HTTP_METHOD2["PUT"] = "PUT";
  HTTP_METHOD2["DELETE"] = "DELETE";
})(HTTP_METHOD ||= {});
var HTTP_RESPONSE_TYPE;
((HTTP_RESPONSE_TYPE2) => {
  HTTP_RESPONSE_TYPE2["arrayBuffer"] = "arrayBuffer";
  HTTP_RESPONSE_TYPE2["arraybuffer"] = "arraybuffer";
  HTTP_RESPONSE_TYPE2["stream"] = "stream";
  HTTP_RESPONSE_TYPE2["json"] = "json";
  HTTP_RESPONSE_TYPE2["blob"] = "blob";
  HTTP_RESPONSE_TYPE2["formData"] = "formData";
  HTTP_RESPONSE_TYPE2["text"] = "text";
})(HTTP_RESPONSE_TYPE ||= {});

class FetchAxios {
  requestInterceptors = [];
  responseInterceptors = [];
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
  async processRequest(url, init) {
    init.url = url;
    for (const interceptor of this.requestInterceptors) {
      const newRequest = await interceptor(init);
      if (!!newRequest && "url" in newRequest) {
        Object.assign(init, newRequest);
      }
    }
    if (!!init.body && !(init.body instanceof Buffer || init.body instanceof ReadableStream) && typeof init.body === "object" && (!init.headers || !init.headers["Content-Type"] || init.headers["Content-Type"] === "application/json")) {
      if (!init.headers)
        init.headers = {};
      if (!init.headers["Content-Type"])
        init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(init.body);
    } else if (!!init.headers) {
      delete init.headers["Content-Type"];
    }
    return new Request(init.url, init);
  }
  async processResponse(request, response, options) {
    let data = null;
    if (response.ok) {
      if (options?.responseType) {
        if (options.responseType === "arraybuffer" /* arraybuffer */) {
          data = Buffer.from(await response.arrayBuffer());
        } else if (options.responseType === "stream" /* stream */) {
          data = response.body;
        } else {
          data = await response[options.responseType]();
        }
      } else {
        data = await this.handelUnknownResponse(response);
      }
    } else {
      data = response.data || await this.handelUnknownResponse(response);
    }
    let toReturn = {
      data,
      headers: response.headers,
      ok: response.ok,
      status: response.status,
      config: { ...request },
      statusText: response.statusText
    };
    for (const toDel of ["body", "headers", "method", "url"]) {
      delete toReturn.config[toDel];
    }
    for (const interceptor of this.responseInterceptors) {
      toReturn = await interceptor(toReturn);
    }
    if (!response.ok) {
      throw { response: toReturn, message: toReturn.statusText || "Internal Server Error" };
    }
    return toReturn;
  }
  async handelUnknownResponse(response) {
    let text = null;
    try {
      text = await response.text();
      text = JSON.parse(text);
    } catch (e) {
    }
    return text;
  }
  async performFetch(url, options = { responseType: "json" /* json */ }, method, data) {
    options = { ...options };
    const init = Object.assign(options, { body: data });
    delete init.data;
    if (method) {
      init.method = method;
    }
    if (!init.headers) {
      init.headers = {};
    }
    try {
      const request = await this.processRequest(url, init);
      const response = await fetch(request);
      return this.processResponse(init, response, options);
    } catch (error) {
      return this.processResponse(init, {
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
    return this.performFetch(url, options, "GET" /* GET */);
  }
  async post(url, data, options) {
    return this.performFetch(url, options, "POST" /* POST */, data);
  }
  async patch(url, data, options) {
    return this.performFetch(url, options, "PATCH" /* PATCH */, data);
  }
  async put(url, data, options) {
    return this.performFetch(url, options, "PUT" /* PUT */, data);
  }
  async delete(url, data, options) {
    return this.performFetch(url, options, "DELETE" /* DELETE */, data);
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
