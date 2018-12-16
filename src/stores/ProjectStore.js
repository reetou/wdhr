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
  @observable showParticipationForm = false
  @observable creating = false
  @observable participationLoading = false

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
          this.auth.redirect('/myprojects')
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
  requestParticipation(projectId, comment, position) {
    this.participationLoading = true
    Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/project/participation/request/${projectId}`,
      method: 'POST',
      data: {
        position,
        comment
      }
    }))
      .finally(() => this.participationLoading = false)
      .subscribe(
        res => {
          console.log(`Request successfully sent`, res.data)
          this.showParticipationForm = false
          this.currentProject = res.data
        },
        err => {
          console.log(`Error at request participation`, err)
        }
      )
  }

  @action.bound
  revertParticipationRequest(projectId) {
    this.participationLoading = true
    Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/project/participation/request/${projectId}`,
      method: 'DELETE'
    }))
      .finally(() => this.participationLoading = false)
      .subscribe(
        res => {
          console.log(`Request successfully reverted`, res.data)
          this.showParticipationForm = false
          this.currentProject = res.data
        },
        err => {
          console.log(`Error at request participation`, err)
        }
      )
  }

  @action.bound
  remove(id) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects/${id}`,
      method: 'DELETE',
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