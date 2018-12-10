import { observable, action, computed } from 'mobx'
import * as Rx from 'rxjs/Rx'
import * as mobxUtils from 'mobx-utils'
import axios from 'axios'
import * as _ from 'lodash'

export default class ProjectStore {
  constructor(app, auth) {
    this.app = app
    this.auth = auth
  }

  @observable created = {}
  @observable projects = []
  @observable userProjects = []
  @observable cursor = 0
  @observable hasMore = true
  @observable loading = false
  @observable error = ''

  @computed get
  sortedProjects() {
    return _.sortBy(this.projects, 'id')
  }

  @computed get
  sortedUserProjects() {
    return _.sortBy(this.userProjects, 'id')
  }

  @action.bound
  create(data) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects`,
      method: 'POST',
      headers: {
        Token: this.auth.user.token
      },
      data: {
        ...data,
        is_public: data.is_public || false,
        type: Number(data.type)
      }
    }))
    obs
      .finally(() => this.loading = false)
      .subscribe(v => console.log('V???', v), err => console.log('ERrr', err), (d) => console.log('complete', d))
  }

  @action.bound
  remove(id) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects/${id}`,
      method: 'DELETE',
      headers: {
        Token: this.auth.user.token
      },
    }))
    obs
      .finally(() => this.loading = false)
      .subscribe(
        v => console.log('Deleted project', v.data),
        err => console.log('Err at delete project', err),
        () => {
          this.projects = []
          this.loadUserProjects()
          this.loadAll()
        }
      )
  }

  @action.bound
  edit(id, data) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/user/projects/${id}`,
      method: 'PUT',
      headers: {
        Token: this.auth.user.token
      },
      data,
    }))
    obs
      .finally(() => this.loading = false)
      .subscribe(
        v => console.log('Edited project', v.data),
        err => console.log('Err at delete project', err),
        () => {
          this.projects = []
          this.loadUserProjects()
          this.loadAll()
        }
      )
  }

  @action.bound
  loadUserProjects() {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/user/projects`,
      method: 'GET',
      headers: {
        Token: this.auth.user.token
      },
    }))
    obs
      .finally(() => this.loading = false)
      .subscribe(
        res => {
          this.userProjects = res.data.projects
        },
        e => {
          console.log('Error', e)
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
    if (!this.projects.length) {
      this.hasMore = true
      this.cursor = 0
    }
    if (!this.hasMore) this.projects = []
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects?cursor=${this.cursor}`,
      method: 'GET',
      headers: {
        Token: this.auth.user.token
      },
    }))
    obs
      .finally(() => this.loading = false)
      .subscribe(
        res => {
          this.projects = this.projects.concat(res.data.projects)
          if (res.data.cursor) {
            this.cursor = res.data.cursor
            this.hasMore = Boolean(Number(res.data.cursor))
          }
        },
        e => {
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
      url: `${this.app.API_HOST}/api/projects/rate`,
      method: down ? 'DELETE' : 'POST',
      data: {
        id: Number(id)
      },
      headers: {
        Token: this.auth.user.token
      }
    }))
    obs
      .finally(() => this.loading = false)
      .subscribe(
        res => console.log('Received response', res),
        e => console.log('Error at rate', e),
        () => {
          this.projects = this.projects.map(p => {
            if (Number(p.id) === Number(id)) {
              if (down && p.rating > 0) p.rating -= 1
              if (!down) p.rating += 1
            }
            return p
          })
          if (down) {
            const index = this.auth.user.rated.indexOf(Number(id))
            this.auth.user.rated.splice(index, 1)
            return
          }
          this.auth.user.rated.push(Number(id))
        }
      )
  }

}