import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar, Row, Col
} from 'antd';
import RequestParticipationFormDrawer from "../ui/RequestParticipationFormDrawer"
const _ = require('lodash')

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
    if (_.isEmpty(project.currentProject)) project.loadProject(projectId)
  }

  render() {
    const { project } = this.props
    if (project.loading) return <h1>Loading</h1>
    const proj = project.currentProject
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <RequestParticipationFormDrawer />
        <Row>
          <Col xs={24} sm={12}>
            <h1>{_.capitalize(project.currentProject.name)} purojecto</h1>
            <p>by {proj.author}</p>
          </Col>
          <Col xs={24} sm={12}>
            {
              proj.owner ?
                <React.Fragment>
                  <Button>Просмотреть реквесты</Button>
                </React.Fragment> :
                <React.Fragment>
                  <Button disabled={project.showParticipationForm} onClick={() => project.showParticipationForm = true}>
                    Отправить реквест на участие
                  </Button>
                </React.Fragment>
            }
          </Col>
        </Row>
      </div>
    )
  }
}