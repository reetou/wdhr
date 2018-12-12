import { observable, action } from 'mobx'
import _ from 'lodash'
import * as Rx from 'rxjs/Rx'
import axios from 'axios'
import * as mobxUtils from 'mobx-utils'

export default class AppStore {
  @observable loggedIn = false
  @observable collapsed = false
  @observable header = 'WDH'
  @observable API_HOST = 'http://kokoro.codes'

  @observable history = null
  @observable axios = null
}