import axios from "axios";
import { BASEURL } from "./constants";

type methodType = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

const cancelTokenSource = axios.CancelToken.source();

export const axiosClient = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
  cancelToken: cancelTokenSource.token,
});

export function baseFetchQuery(
  path: string,
  method: methodType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryParams?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any,
) {
  axiosClient.interceptors.request.use((config) => {
    if (headers) {
      config.headers = {
        ...config.headers,
        ...headers,
      };
    }

    if (queryParams) {
      config.params = {
        ...config.params,
        ...queryParams,
      };
    }

    return config;
  });

  return async () => {
    switch (method) {
      case "GET":
        return await axiosClient.get(path);

      case "POST":
        return await axiosClient.post(path, data);

      case "PATCH":
        return await axiosClient.patch(path, data);

      case "DELETE":
        return await axiosClient.delete(path, data);

      case "PUT":
        return await axiosClient.put(path, data);
    }
  };
}
