import axios from "axios";

// 本接口为测试接口,真实接口请联系coderwhy001
const url = "https://www.liulongbin.top:8888/api/private/v1/";

// 1.创建axios的实例
const instance = axios.create({
  baseURL: url,
  timeout: 5000,
});

// 2.axios的拦截器
// 2.1.请求拦截的作用
instance.interceptors.request.use(
  (config) => {
    // 为请求头对象，添加token验证的Authorization字段
    config.headers.Authorization = window.sessionStorage.getItem("token");
    return config;
  },
  (err) => {
    return Promise.reject(error);
    console.log(err);
  }
);

// 2.2.响应拦截
instance.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    return Promise.reject(error);
    console.log(err);
  }
);

// 3.发送真正的网络请求
// return instance(config);

export default instance;
