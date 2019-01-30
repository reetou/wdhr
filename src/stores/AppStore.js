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
  @observable rules = [
    'Выключи телегу/ютуб/игори/кино/говно и вкатывайся. Сделай так, чтобы во время вката не мешали мамка/бабка/девушка/собака/сосед.',
    'Если дурачок ленивый, делай каждый день хоть что-то, но каждый день.',
    'Регулярность. Не больше дня отдыха в идеале.',
    'Смотреть ролики на ютубчике или слушать подкасты пускай даже в тему не считаются за полезное дело.',
    'Пиши код. Нет ничего лучше практики написания кода.',
    'Пиши свой проект. Никаких тудулистов. Если нужно, расписывай план проекта в trello',
    'Учи не всё подряд, а по плану.',
    'Используй ежедневник для постановки задач или веди блог, в котором каждый день пиши, что сделал и что новое узнал.',
    'Что-то непонятно - гугли. На английском',
    'Не помог гугол - спроси на StackOverflow (английском обязательно) или любом другом тематическом сообществе',
    'Учи инглиш. Инфы на русском мало и она неактуальна',
    'Помогай другим участникам сообщества по мере своих сил',
    'Не бухай - ухудшает когнитивные способности',
    'Не переедай - будет лень заниматься чем-либо',
    'Высыпайся',
    'Не сиди все время за компьютером, выходи пробздеться или поупражняйся'
  ]

  @observable history = null
  @observable axios = axiosConfigured
  @observable DENY_REASONS = []
  @observable TECHS = []
  @observable PUSHER_KEY = ''

}