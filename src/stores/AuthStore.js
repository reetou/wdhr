import { observable, action, toJS } from 'mobx'
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
  @observable loggingIn = false


  @action.bound
  redirect(to) {
    console.log(`Redirecting to ${to}`)
    this.app.history.push(to)
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
    const userData = _.cloneDeep(data)
    delete userData.pusher
    this.user = userData
    this.app.DENY_REASONS = data.participate_deny_reasons
    this.app.TECHS = data.techs
    this.login = data.login
    this.loggedIn = true
    this.loading = false
    this.app.PUSHER_KEY = data.pusher
  }

  @action.bound
  async initLogin(redirectTo = false) {
    if (this.loggingIn || this.loggedIn) return
    try {
      this.loggingIn = true
      this.loading = true
      const response = await this.app.axios.get(`${this.app.API_HOST}/api/user`)
      this.doLogin(response.data)
      this.loggingIn = false
      return true
    } catch (e) {
      // noop
      console.log('Error at init login', e)
      this.loggingIn = false
      this.loading = false
      this.loggedIn = false
      this.app.history.push('/login')
      return false
    }
  }



}