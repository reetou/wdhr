import { observable, action, autorun } from 'mobx'
import _ from 'lodash'
import * as Rx from 'rxjs/Rx'
import axios from 'axios'
import * as mobxUtils from 'mobx-utils'
import { toJS } from "mobx/lib/mobx"

let config = {
  withCredentials: true
}

const axiosConfigured = axios.create(config)
axiosConfigured.defaults.withCredentials = true

export default class AppStore {
  @observable loggedIn = false
  @observable collapsed = true
  @observable header = 'WDH'
  @observable path = '/'
  @observable API_HOST = process.env.NODE_ENV === 'production' ? 'http://kokoro.codes' : 'http://localhost:4000'

  @observable history = null
  @observable axios = axiosConfigured
  @observable DENY_REASONS = []
  @observable TECHS = []
  @observable PUSHER_KEY = ''

}