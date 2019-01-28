import { observable, action, computed } from 'mobx'
import * as Rx from 'rxjs/Rx'
import * as mobxUtils from 'mobx-utils'
import axios from 'axios'
import * as _ from 'lodash'

export default class ArticleStore {
  constructor(app, auth) {
    this.app = app
    this.auth = auth
  }

  @observable created = {}
  @observable articles = []
  @observable userArticles = []
  @observable cursor = 0
  @observable hasMore = true
  @observable loading = false
  @observable error = ''

  @computed get
  sortedArticles() {
    return _.sortBy(this.articles, 'id')
  }

  @computed get
  sortedUserArticles() {
    return _.sortBy(this.userArticles, 'id')
  }

  @action.bound
  create(data) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/articles`,
      method: 'POST',
      data: {
        ...data,
        is_public: data.is_public || false,
      }
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(v => console.log('V???', v), err => console.log('ERrr', err), (d) => console.log('complete', d))
  }

  @action.bound
  remove(id) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/articles/${id}`,
      method: 'DELETE',
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(
        v => console.log('Deleted article', v.data),
        err => console.log('Err at delete article', err),
        () => {
          this.articles = []
          this.loadUserArticles()
          this.loadAll()
        }
      )
  }

  @action.bound
  edit(id, data) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/user/articles/${id}`,
      method: 'PUT',
      data,
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(
        v => console.log('Edited article', v.data),
        err => console.log('Err at delete article', err),
        () => {
          this.articles = []
          this.loadUserArticles()
          this.loadAll()
        }
      )
  }

  @action.bound
  loadUserArticles() {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/user/articles`,
      method: 'GET',
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(
        res => {
          console.log(`RES AT GET USER ARTICLES`, res)
          this.userArticles = res.data.articles
        },
        e => {
          console.log('Error at load user articles', e)
          const validationErr = _.at(e, 'response.data.err')[0]
          if (validationErr) {
            this.error = validationErr
          } else {
            this.error = e.message
          }
        },
        () => this.error = ''
      )
  }

  @action.bound
  loadAll() {
    this.loading = true
    if (!this.articles.length) {
      this.hasMore = true
      this.cursor = 0
    }
    if (!this.hasMore) this.articles = []
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/articles?page=${this.cursor}`,
      method: 'GET',
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(
        res => {
          console.log(`RES AT LOAD ARTICLES`, res)
          this.articles = this.articles.concat(res.data.articles)
          if (res.data.cursor) {
            this.cursor = this.cursor + 1
            this.hasMore = Boolean(Number(res.data.cursor))
          }
        },
        e => {
          console.log('Error at load all articles', e)
          const validationErr = _.at(e, 'response.data.err')[0]
          if (validationErr) {
            this.error = validationErr
          } else {
            this.error = e.message
          }
        },
        () => this.error = ''
      )
  }

  @action.bound
  rate(id, down = false) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/articles/rate`,
      method: down ? 'DELETE' : 'POST',
      data: {
        id: Number(id)
      },
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(
        res => console.log('Received response', res),
        e => console.log('Error at rate article', e),
        () => {
          this.articles = this.articles.map(p => {
            if (Number(p.id) === Number(id)) {
              if (down && p.rating > 0) p.rating -= 1
              if (!down) p.rating += 1
            }
            return p
          })
          if (down) {
            const index = this.auth.user.rated_articles.indexOf(Number(id))
            this.auth.user.rated_articles.splice(index, 1)
            return
          }
          this.auth.user.rated_articles.push(Number(id))
        }
      )
  }

}