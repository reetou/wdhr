import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Button, Row, Col, Upload
} from 'antd'
import RequestParticipationFormDrawer from "../ui/RequestParticipationFormDrawer"
import { toJS } from "mobx/lib/mobx"
import EditProjectFormDrawer from "../ui/EditProjectFormDrawer"
import UIAvatar from "../ui/Avatar"
import * as _ from 'lodash'

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class Project extends React.Component {

  componentDidMount() {
    const project = this.props.project
    const projectId = _.at(this.props, 'match.params.id')[0]
    if (_.isNaN(Number(projectId)) || Number(projectId) === 0) {
      return this.props.history.push('/myprojects')
    }
    console.log(`Empty?`, _.isEmpty(toJS(project.currentProject)), project.currentProject)
    if (_.isEmpty(toJS(project.currentProject))) project.loadProject(projectId)
  }

  render() {
    const { project, app } = this.props
    if (project.loading) return <h1>Loading</h1>
    const proj = project.currentProject
    const participateButton = () => {
      console.log(`Project rank`, proj.rank)
      switch (proj.rank) {
        case -1:
          return (
            <Button disabled={project.showParticipationForm} onClick={() => project.showParticipationForm = true}>
              Участвовать
            </Button>
          )
        case 0:
          return (
            <Button onClick={() => project.revertParticipationRequest(proj.project_id)}>Отозвать заявку</Button>
          )
        case 1:
          return (
            <Button disabled>Отказано в участии :(</Button>
          )
        case 2:
          return (
            <React.Fragment>
              <Button onClick={() => this.props.history.push(`/projects/${proj.project_id}/participants`)}>Участники</Button>
            </React.Fragment>
          )
        case 3:
          return (
            <React.Fragment>
              <Button style={{ marginBottom: 4 }} block onClick={() => this.props.history.push(`/projects/${proj.project_id}/requests`)}>Просмотреть заявки</Button>
              <Button style={{ marginBottom: 4 }} block onClick={() => this.props.history.push(`/projects/${proj.project_id}/members`)}>Участники</Button>
              <Button style={{ marginBottom: 4 }} block onClick={() => this.props.history.push(`/projects/${proj.project_id}/upload`)}>Выложить на кокоро</Button>
              <Button style={{ marginBottom: 4 }} disabled={project.showEditForm || project.loading} block onClick={() => project.showEditForm = true}>Редактировать</Button>
            </React.Fragment>
          )
        default: return <div>Ошибка, не могу показать кнопку. Ранк: {proj.rank}</div>
      }
    }

    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <RequestParticipationFormDrawer />
        <EditProjectFormDrawer/>
        <Row>
          <Col xs={24} sm={16}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {
                proj.owner ? <Button disabled>
                  <Icon
                    type={'team'}
                  />
                  <span>{proj.members_count}</span>
                </Button> : null
              }
              <h1 style={{ marginBottom: 0, marginLeft: 10 }}>{_.capitalize(proj.project_name)} purojecto</h1>
            </div>
            <p>by {proj.owner}</p>
            <UIAvatar
              url={proj.avatar_url || ''}
              style={{
                justifyContent: 'flex-start'
              }}
            />
            <p>Стек и технологии: {project.parsedTechs}</p>
            <p>Рейтинг: {proj.rating}</p>
            {
              proj.repository_id && <p><a href={`https://github.com/${proj.full_name}`} target={'_blank'}>{proj.full_name}</a></p>
            }
            <h3>{proj.title}</h3>
            <p>{proj.description}</p>
          </Col>
          <Col xs={24} sm={8}>
            {participateButton()}
          </Col>
        </Row>
      </div>
    )
  }
}