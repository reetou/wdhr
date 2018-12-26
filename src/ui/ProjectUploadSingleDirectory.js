import React from 'react'
import { observable, toJS, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Button, Row, Col, Upload, Switch, Tooltip
} from 'antd'
const _ = require('lodash')


@inject('app', 'auth', 'project')
@observer
export default class ProjectUploadSingleDirectory extends React.Component {

  @observable files = []
  @computed get hasIndexHtml() {
    if (!this.files.length) return true
    return this.files.some(f => f.name === 'index.html')
  }

  render() {
    const { project, app } = this.props
    const proj = project.currentProject
    return <div style={{ background: '#fff', minHeight: 460 }}>
      <p>Залей свою папку с бандлом сюда, чтобы Чоко собрала все и выложила на <a href={`http://${proj.id}-${proj.name}.kokoro.codes`} style={{ fontWeight: 'bold' }} target={'_blank'}>{proj.id}-{proj.name}.kokoro.codes!</a></p>
      {
        this.files.length ? <p>Файлов: <span style={{ fontWeight: 'bold' }}>{String(this.files.length)}</span></p> : null
      }
      {
        !this.hasIndexHtml ? <p style={{ color: 'red' }}>Ты не залил index.html! Без него ничего работать не будет.</p> : null
      }
      <Row>
        <Col xs={12} sm={6}>
          <Upload
            multiple
            onRemove={file => {
              const index = this.files.indexOf(file)
              const clone = _.cloneDeep(toJS(this.files))
              clone.splice(index, 1)
              this.files = clone
            }}
            beforeUpload={file => {
              this.files.push(file)
              console.log(`FILE UPLOAD`, file)
              return false
            }}
            fileList={this.files}
            disabled={project.loading}
          >
            <Button disabled={project.loading}>
              <Icon type="upload" /> Выбрать файлы
            </Button>
          </Upload>
        </Col>
        <Col xs={24} sm={4}>
          <Button
            disabled={!this.files.length || project.loading}
            onClick={() => project.uploadBundle(toJS(this.files), proj.id, () => this.files = [])}
          >
            Загрузить
          </Button>
        </Col>
        <Col xs={24} sm={4}>
          <Button
            disabled={!this.files.length || project.loading}
            onClick={() => this.files = []}
          >
            Очистить
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button
            type={'danger'}
            disabled={project.loading}
            onClick={() => project.clearProjectStorage(proj.id)}
          >
            Форматировать хранилище
          </Button>
        </Col>
      </Row>
    </div>
  }
}
