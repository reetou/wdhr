import React from 'react'
import { observable, toJS, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Button, Row, Col, Upload, Switch, Tooltip
} from 'antd'
import ProjectUploadSingleDirectory from "../ui/ProjectUploadSingleDirectory"
import ProjectUploadMultipleDirectory from "../ui/ProjectUploadMultipleDirectory"
import * as _ from 'lodash'

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class ProjectUpload extends React.Component {

  @observable route = 2

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
    const proj = project.currentProject
    const projectDirectoryType = () => {
      switch (this.route) {
        case 1: return <ProjectUploadSingleDirectory />
        case 2: return <ProjectUploadMultipleDirectory/>
        default: return <div />
      }
    }

    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <Row gutter={8} type={'flex'}>
          <Col xs={24} sm={3}><p>Тип проекта: </p></Col>
          <Col xs={24} sm={6}>
            <Tooltip
              placement="rightTop"
              title={
                `Выбери малый, если все файлы твоего фронтенда лежат в одной папке рядом с index.html.
              Если же твой собранный проект содержит вложенность директорий, где картинки лежат в директории img и все такое - выбирай большой.
              При загрузке проекта с несколькими директориями максимальный лимит на каждый файл 3.5мб.`
              }
            >
              <Switch checked={this.route === 2} onChange={val => this.route = val ? 2 : 1} checkedChildren="Большой" unCheckedChildren="Малый" />
            </Tooltip>
          </Col>
        </Row>
        {projectDirectoryType()}
      </div>
    )
  }
}