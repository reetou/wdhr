import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar, Row, Col
} from 'antd';
import RequestParticipationFormDrawer from "../ui/RequestParticipationFormDrawer"
import { toJS } from "mobx/lib/mobx"
const _ = require('lodash')

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
    const { project } = this.props
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
            <Button>Отказаться от участия в проекте</Button>
          )
        case 3:
          return (
            <Button onClick={() => this.props.history.push(`/projects/${proj.id}/requests`)}>Просмотреть заявки</Button>
          )
        default: return <div>Ошибка, не могу показать кнопку</div>
      }
    }
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <RequestParticipationFormDrawer />
        <Row>
          <Col xs={24} sm={16}>
            <h1>{_.capitalize(proj.name)} purojecto</h1>
            <p>by {proj.author}</p>
          </Col>
          <Col xs={24} sm={8}>
            {participateButton()}
          </Col>
        </Row>
      </div>
    )
  }
}