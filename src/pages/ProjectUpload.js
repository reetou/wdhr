import React from 'react'
import { observable, toJS, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar, Row, Col, Modal, Radio, Upload
} from 'antd'
const _ = require('lodash')

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class ProjectUpload extends React.Component {

  @computed get
  hasIndexHtml() {
    if (!this.files.length) return true
    return this.files.some(f => f.name === 'index.html')
  }

  @observable files = []

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
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <p>Залей свою папку с бандлом сюда, чтобы Чоко собрала все и выложила на <a href={`http://${proj.id}-${proj.name}.kokoro.codes`} style={{ fontWeight: 'bold' }} target={'_blank'}>{proj.id}-{proj.name}.kokoro.codes!</a></p>
        {
          this.files.length ? <p>Файлов: <span style={{ fontWeight: 'bold' }}>{String(this.files.length)}</span></p> : null
        }
        {
          !this.hasIndexHtml ? <p style={{ color: 'red' }}>Ты не залил index.html! Без него ничего работать не будет.</p> : null
        }
        {
          proj.owner ?
            <Row>
              <Col xs={12} sm={6}>
                <Upload
                  directory
                  onRemove={file => {
                    const index = this.files.indexOf(file)
                    const clone = _.cloneDeep(toJS(this.files))
                    clone.splice(index, 1)
                    this.files = clone
                  }}
                  beforeUpload={file => {
                    this.files.push(file)
                    return false
                  }}
                  fileList={this.files}
                  disabled={project.loading}
                >
                  <Button disabled={project.loading}>
                    <Icon type="upload" /> Выбрать папку
                  </Button>
                </Upload>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  disabled={!this.files.length || project.loading}
                  onClick={() => project.uploadBundle(toJS(this.files), proj.id, () => this.files = [])}
                >
                  Загрузить
                </Button>
              </Col>
            </Row>
            : null
        }
      </div>
    )
  }
}