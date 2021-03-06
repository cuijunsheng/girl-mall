import axios from 'axios'

export function request(config) {

  /**
   * 1.创建axios实例
   */
  const instance = axios.create({
    baseURL: '111111111111',
    timeout: 5000
  })

  /**
   * 2.axios的拦截器，分为请求拦截和响应拦截，同时可以直接全局axios拦截，但大多是是实例拦截
   */
  //2.1 请求拦截
  instance.interceptors.request.use(config => {
    return config
  }, err => {

  })

  //2.2 响应拦截
  instance.interceptors.response.use(res => {
    return res.data;
  }, err => {

  })

  /**
   * 3.发送真正的网络请求
   */
  return instance(config)

}
