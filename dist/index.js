import {
FetchAxios
} from "./fetchAxios.js";

// src/index.ts
var extend = (a, b, thisArg) => {
  const keys = Object.getOwnPropertyNames(b);
  keys.forEach((key) => {
    if (key === "constructor") {
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
var instance = new FetchAxios;
var axios = FetchAxios.prototype.request.bind(instance);
extend(axios, FetchAxios.prototype, instance);
extend(axios, instance, null);
var src_default = axios;
export {
  src_default as default
};
