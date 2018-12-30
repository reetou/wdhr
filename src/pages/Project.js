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

const getCoeff = (project) => {
  let participate_coeff = 0
  if (project.owner) return 3
  if (project.is_participator) return 2
  if (project.is_requested_participation) return 1
  return participate_coeff
}

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
      switch (getCoeff(proj)) {
        case 0:
          return (
            <Button disabled={project.showParticipationForm} onClick={() => project.showParticipationForm = true}>
              Участвовать
            </Button>
          )
        case 1:
          return (
            <Button onClick={() => project.revertParticipationRequest(proj.id)}>Отозвать заявку</Button>
          )
        case 2:
          return (
            <React.Fragment>
              <Button onClick={() => this.props.history.push(`/projects/${proj.id}/participants`)}>Участники</Button>
            </React.Fragment>
          )
        case 3:
          return (
            <React.Fragment>
              <Button style={{ marginBottom: 4 }} block onClick={() => this.props.history.push(`/projects/${proj.id}/requests`)}>Просмотреть заявки</Button>
              <Button style={{ marginBottom: 4 }} block onClick={() => this.props.history.push(`/projects/${proj.id}/members`)}>Участники</Button>
              <Button style={{ marginBottom: 4 }} block onClick={() => this.props.history.push(`/projects/${proj.id}/upload`)}>Выложить на кокоро</Button>
              <Button style={{ marginBottom: 4 }} disabled={project.showEditForm || project.loading} block onClick={() => project.showEditForm = true}>Редактировать</Button>
            </React.Fragment>
          )
        default: return <div>Ошибка, не могу показать кнопку</div>
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
              <h1 style={{ marginBottom: 0, marginLeft: 10 }}>{_.capitalize(proj.name)} purojecto</h1>
            </div>
            <p>by {proj.author}</p>
            <UIAvatar
              url={proj.avatar_url || ''}
              style={{
                justifyContent: 'flex-start'
              }}
            />
            <p>Стек и технологии: {project.parsedTechs}</p>
            <p>Рейтинг: {proj.rating}</p>
            {
              proj.repo && <p><a href={proj.repo.html_url} target={'_blank'}>{proj.repo.html_url}</a></p>
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