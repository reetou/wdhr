import { observable, action, computed, toJS } from 'mobx'
import * as Rx from 'rxjs/Rx'
import * as mobxUtils from 'mobx-utils'
import axios from 'axios'
import * as _ from 'lodash'

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time))

export default class ProjectStore {
  constructor(app, auth) {
    this.app = app
    this.auth = auth
  }

  @observable created = {}
  @observable projects = []
  @observable currentProject = {}
  @observable userProjects = []
  @observable cursor = 0
  @observable hasMore = true
  @observable loading = false
  @observable error = ''
  @observable creating = false

  @computed get
  sortedProjects() {
    return _.sortBy(this.projects, 'id')
  }

  @computed get
  sortedUserProjects() {
    return _.sortBy(this.userProjects, 'id')
  }

  @action.bound
  loadProject(id) {
    return Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects/${id}`,
      method: 'GET',
    }))
      .subscribe(
        v => {
          this.currentProject = v.data
          console.log(`Loaded project ${id}`, toJS(this.currentProject))
        },
        err => {
          console.log(`Error at load single project id ${id}`, err)
          this.app.history.push('/myprojects')
        },
        () => console.log('Complete')
      )
  }

  @action.bound
  create(data) {
    this.loading = true
    this.creating = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects`,
      method: 'POST',
      headers: {
        Token: this.auth.user.token
      },
      data: {
        ...data,
        is_public: data.is_public || false,
      }
    }))
      .delay(500)
      .finally(() => {
        this.loading = false
        this.creating = false
        this.app.history.push('/myprojects')
        console.log('At finally, set creating to false', this.creating)
      })
      .subscribe(v => console.log('V???', v), err => console.log('Error at create project', err), (d) => console.log('complete', d))
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
      .subscribe(
        v => {
          this.projects = []
          console.log('Deleted project', v.data)
        },
        err => console.log('Err at delete project', err),
        () => {
          this.loadAll(false)
          this.loadUserProjects(true)
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
      .subscribe(
        v => {
          this.projects = []
          console.log('Edited project', v.data)
        },
        err => console.log('Err at delete project', err),
        () => {
          this.loadAll(false)
          this.loadUserProjects(true)
        }
      )
  }

  @action.bound
  loadUserProjects(end = true) {
    const backupUserProjects = JSON.parse(JSON.stringify({ projects: this.userProjects }))
    this.loading = true
    this.userProjects = []
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/user/projects`,
      method: 'GET',
      headers: {
        Token: this.auth.user.token
      },
    }))
      .delay(450)
      .finally(() => {
        if (end) this.loading = false
      })
      .subscribe(
        res => {
          console.log(`User projects`, res.data.projects)
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
          this.userProjects = backupUserProjects.projects
        },
        () => this.error = ''
      )
  }

  @action.bound
  loadAll(end = true) {
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
      .finally(() => {
        if (end) this.loading = false
      })
      .subscribe(
        res => {
          this.projects = this.projects.concat(res.data.projects)
          console.log(`all projects`, toJS(this.projects))
          this.cursor = res.data.cursor
          this.hasMore = Boolean(Number(res.data.cursor))
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
      .finally(() => {
        this.loading = false
      })
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