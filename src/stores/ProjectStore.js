import { observable, action, computed, toJS } from 'mobx'
import * as Rx from 'rxjs/Rx'
import * as _ from 'lodash'
import { message } from 'antd'


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
  @observable showEditForm = false
  @observable creating = false
  @observable requestLoading = false
  @observable participationLoading = false
  @observable requestDecision = {}
  @observable showDenyReasonForm = false
  @observable denyReason = 0
  @observable denyPerson = ''
  @observable loadingAvatar = false

  @computed get
  parsedDenyReason() {
    return this.app.DENY_REASONS[this.denyReason]
  }

  @computed get
  sortedProjects() {
    return _.sortBy(this.projects, 'id')
  }

  @computed get
  parsedTechs() {
    if (!this.currentProject.techs) return []
    return this.currentProject.techs.map(v => this.app.TECHS[v].name).join(', ')
  }

  @computed get
  projectMembers() {
    if (!this.currentProject.members) return []
    return this.currentProject.members.filter(v => !v.project_owner)
  }

  @computed get
  sortedUserProjects() {
    return _.sortBy(this.userProjects, 'id')
  }

  @action.bound
  initDenyReason(login) {
    this.denyPerson = login
    this.denyReason = 0
    this.showDenyReasonForm = true
  }

  @action.bound
  resetDenyReason() {
    this.denyPerson = ''
    this.denyReason = 0
    this.showDenyReasonForm = false
  }

  @action.bound
  loadProject(id, cb) {
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
        () => {
          console.log('Complete', this.currentProject.owner)
          if (cb) cb(this.currentProject)
        }
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
      .subscribe(
        v => console.log(`CREATED PROJECT WITH ${v.data.id}`, v),
        err => {
          console.error(`Error at create project`, err)
          const defaultErrMessage = `Ошибка создания проекта`
          const errMessage = _.has(err, 'response.data.err') ? `${defaultErrMessage}: ${err.response.data.err}` : defaultErrMessage
          message.error(errMessage)
        },
        () => message.success(`Проект ${data.project_name} создан успешно.`, 2.5))
  }

  @action.bound
  requestParticipation(projectId, data) {
    this.participationLoading = true
    Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/project/participation/request/${projectId}`,
      method: 'POST',
      data
    }))
      .finally(() => this.participationLoading = false)
      .subscribe(
        res => {
          console.log(`Request successfully sent`, res.data)
          this.showParticipationForm = false
          this.currentProject = res.data
        },
        err => {
          message.error('Ошибка при отправке реквеста')
          console.log(`Error at request participation`, err)
        },
        () => message.success('Запрос отправлен успешно')
      )
  }

  @action.bound
  denyParticipationRequest(projectId) {
    const login = this.denyPerson
    Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/project/participation/owner/deny/${projectId}`,
      method: 'POST',
      data: {
        request_login: login,
        reason: this.parsedDenyReason
      }
    }))
      .subscribe(
        res => {
          console.log(`Participant accepted successfully`, res.data)
          this.currentProject = res.data
        },
        err => {
          console.log(`Error at request accept as owner`, err)
          message.error('Не удалось отклонить реквест')
        },
        () => {
          this.requestDecision = {
            ...this.requestDecision,
            [`project_${projectId}_login_${login}`]: 'DENIED'
          }
          this.resetDenyReason()
        }
      )
  }

  @action.bound
  acceptParticipationRequest(projectId, login, cb) {
    console.log(`Accepting request for project id ${projectId} and login ${login}`)
    Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/project/participation/owner/accept/${projectId}`,
      method: 'POST',
      data: { request_login: login }
    }))
      .subscribe(
        res => {
          console.log(`Participant accepted successfully`, res.data)
          this.currentProject = res.data
        },
        err => {
          console.log(`Error at request accept as owner`, err)
          message.error('Не удалось принять реквест')
        },
        () => {
          this.requestDecision = {
            ...this.requestDecision,
            [`project_${projectId}_login_${login}`]: 'ACCEPTED'
          }
          message.success('Запрос успешно одобрен')
          if (cb) cb()
          console.log(`Request decision`, toJS(this.requestDecision))
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
          message.error('Не удалось отозвать заявку')
        },
        () => message.success('Реквест успешно отозван')
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
        err => {
          message.error('Не удалось удалить проект')
          console.log('Err at delete project', err)
        },
        () => {
          message.success('Проект удален успешно')
          this.loadAll(false)
          this.loadUserProjects(true)
        }
      )
  }

  @action.bound
  edit(id, data, cb) {
    this.loading = true
    const backup = toJS(this.userProjects)
    this.userProjects = []
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/user/projects/${id}`,
      method: 'PUT',
      data,
    }))
      .finally(() => this.loading = false)
      .subscribe(
        v => {
          this.projects = []
          console.log('Edited project', v.data)
          this.currentProject = v.data
        },
        err => {
          message.error('Не удалось отредактировать проект')
          console.log('Err at delete project', err)
          this.userProjects = backup
        },
        () => {
          message.success('Готово', 0.5)
          this.loadAll(false)
          this.loadUserProjects(true)
          if (cb) cb()
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
          console.log(`At load all projects`, res.data)
          this.projects = this.projects.concat(res.data.results)
          // Items per page
          if (res.data.total >= 100) {
            this.cursor = this.cursor + 1
          }
          this.hasMore = Boolean(Number(this.cursor))
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
  uploadAvatar(file, projectId, cb) {
    this.loadingAvatar = true
    const fallback = this.currentProject.avatar_url
    this.currentProject.avatar_url = ''
    const d = new FormData()
    d.append('avatar', file)
    Rx.Observable.fromPromise(this.app.axios({
      method: 'POST',
      url: `${this.app.API_HOST}/api/projects/avatar/${projectId}`,
      data: d,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }))
      .finally(() => this.loadingAvatar = false)
      .subscribe(
        res => {
          this.currentProject.avatar_url = res.data.avatar_url
        },
        err => {
          this.currentProject.avatar_url = fallback
          console.log(`Error at upload`, err)
        },
        () => {
          if (cb) cb()
          message.success('OK')
        }
      )
  }

  @action.bound
  clearProjectStorage(projectId, cb) {
    this.loading = true
    Rx.Observable.fromPromise(this.app.axios({
      method: 'DELETE',
      url: `${this.app.API_HOST}/api/projects/static/${projectId}`,
    }))
      .finally(() => this.loading = false)
      .subscribe(
        d => console.log(`Response at upload`, d),
        err => {
          console.log(`Error at upload`, err, err.response)
          const defaultErrMessage = `Ошибка очистки хранилища проекта`
          const errMessage = _.has(err, 'response.data.err') ? `${defaultErrMessage}: ${err.response.data.err}` : defaultErrMessage
          message.error(errMessage)
        },
        () => {
          if (cb) cb()
          console.log('DID!')
          message.success('Очищено успешно')
        }
      )
  }

  @action.bound
  uploadBundle(files, projectId, cb, msg = 'Загружено успешно!') {
    console.log('files', files)
    this.loading = true
    const d = new FormData()
    files.forEach(f => d.append('app[]', f))
    Rx.Observable.fromPromise(this.app.axios({
      method: 'POST',
      url: `${this.app.API_HOST}/api/projects/static/${projectId}`,
      data: d,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }))
      .finally(() => this.loading = false)
      .subscribe(
        d => console.log(`Response at upload`, d),
        err => {
          console.log(`Error at upload`, err, err.response)
          const defaultErrMessage = `Ошибка загрузки корневой папки`
          const errMessage = _.has(err, 'response.data.err') ? `${defaultErrMessage}: ${err.response.data.err}` : defaultErrMessage
          message.error(errMessage)
        },
        () => {
          if (cb) cb()
          console.log('DID!')
          message.success(msg)
        }
      )
  }

  uploadBundlePart(files, projectId, directory, cb) {
    console.log('files', files)
    this.loading = true
    const d = new FormData()
    files.forEach(f => d.append('app[]', f))
    d.append('folder', directory)
    console.log(`form data`, d)
    Rx.Observable.fromPromise(this.app.axios({
      method: 'POST',
      url: `${this.app.API_HOST}/api/projects/static/${projectId}`,
      data: d,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }))
      .finally(() => this.loading = false)
      .subscribe(
        d => console.log(`Response at upload`, d),
        err => {
          console.log(`Error at upload`, err)

          const defaultErrMessage = `Ошибка загрузки папки ${directory}`
          const errMessage = _.has(err, 'response.data.err') ? `${defaultErrMessage}: ${err.response.data.err}` : defaultErrMessage
          message.error(errMessage)
        },
        () => {
          if (cb) cb()
          console.log(`UPLOADED ${directory}!`)
          message.success(`Папка ${directory} загружена успешно`)
        }
      )
  }

  @action.bound
  rate(id, project_name, down = false) {
    this.loading = true
    const obs = Rx.Observable.fromPromise(this.app.axios({
      url: `${this.app.API_HOST}/api/projects/rate`,
      method: down ? 'DELETE' : 'POST',
      data: {
        project_id: Number(id),
        project_name
      },
    }))
      .finally(() => {
        this.loading = false
      })
      .subscribe(
        res => console.log('Received response', res),
        e => {
          console.log('Error at rate', e)
          message.error(down ? 'Не удалось отменить рейт' : 'Не удалось рейтануть проект')
        },
        () => {
          const project = this.projects.find(p => p.project_id === id)
          if (down && project.rating > 0) project.rating -= 1
          if (!down) project.rating += 1
          if (down) {
            const index = this.auth.user.rated.indexOf(Number(id))
            this.auth.user.rated.splice(index, 1)
            message.success('OK', 0.3)
            return
          }
          this.auth.user.rated.push(Number(id))
          message.success('OK', 0.3)
        }
      )
  }

}