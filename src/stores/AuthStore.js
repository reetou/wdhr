import { observable, action } from 'mobx'
import _ from 'lodash'
import * as Rx from 'rxjs/Rx'
import * as mobxUtils from 'mobx-utils'
import axios from 'axios'

export default class AuthStore {

  constructor(app) {
    this.app = app
  }

  @observable loggedIn = false
  @observable login = ''
  @observable nickname = ''
  @observable error = ''
  @observable loading = false
  @observable user = {}


  @action.bound
  initAxios() {
    if (this.app.axios) return
    let config = {
      withCredentials: true
    }
    this.app.axios = axios.create(config)
    this.app.axios.defaults.withCredentials = true
    let isRefreshing = false
    let refreshSubscribers = []
    const refreshAccessToken = () => {
      return new Promise((resolve, reject) => {
        this.app.axios.get(`${this.app.API_HOST}/api/user`, {}).then(res => {
          if (res.data.token) {
            resolve(res.data.token)
          } else {
            reject(res.data.err)
          }
        }).catch(err => reject(err))
      })
    }

    const subscribeTokenRefresh = cb => {
      refreshSubscribers.push(cb)
    }
    const onRefreshed = token => {
      refreshSubscribers.map(cb => cb(token))
    }
    this.app.axios.interceptors.request.use(
      config => {
        config.headers['Token'] = localStorage.getItem("token");
        return config;
      },
      error => {
        console.log('Error at request', error)
        Promise.reject(error)
      }
    );
    this.app.axios.interceptors.response.use(res => {
      console.log('INTERCEPTOR RES', res)
      return res
    }, err => {
      if (_.at(err, 'response.data.err')[0] && (err.response.data.err === 'jwt expired' || err.response.data.err === 'jwt malformed')) {
        console.log('Token expired, refreshing')
        const originalRequest = err.response.config
        console.log('Config', originalRequest)
        if (!isRefreshing) {
          isRefreshing = true
          refreshAccessToken()
            .then(newToken => {
              console.log('doing new token', newToken)
              isRefreshing = false
              onRefreshed(newToken)
            })
            .catch(err => {
              console.log('at refreshing access token', err)
              isRefreshing = false;
              // adding old token just to add something
              onRefreshed(localStorage.getItem('token'))
            })
        }
        const retryOrigReq = new Promise((resolve, reject) => {
          subscribeTokenRefresh(token => {
            // replace the expired token and retry
            console.log('Resolving with original request')
            resolve(axios(originalRequest))
          })
        })

        return retryOrigReq
      }
      console.log('Rejecting')
      return Promise.reject(err.response || err.message)
    })
  }

  @action.bound
  async register(data) {
    try {
      this.loading = true
      const response = await this.app.axios.post(`${this.app.API_HOST}/api/auth/register`, data)
      console.log('Response at reg', response)
      this.doLogin(response.data)
    } catch (e) {
      console.log('Err at register', e)
      this.loading = false
    }
  }

  @action.bound
  async authorize(data) {
    try {
      this.loading = true
      const response = await this.app.axios.post(`${this.app.API_HOST}/api/auth/login`, data)
      console.log('Response at login', response)
      this.doLogin(response.data)
    } catch (e) {
      console.log('Err at authorize', e)
      this.loading = false
    }
  }

  @action.bound
  doLogin(data) {
    this.user = data
    this.login = data.login
    this.loggedIn = true
    this.loading = false
  }

  @action.bound
  async initLogin() {
    try {
      if (!this.app.axios) await this.initAxios()
      this.loading = true
      const response = await this.app.axios.get(`${this.app.API_HOST}/api/user`)
      this.doLogin(response.data)
      return true
    } catch (e) {
      // noop
      console.log('Error', e)
      this.loading = false
      this.loggedIn = false
      return false
    }
  }



}