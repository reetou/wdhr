import React from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import {
  Drawer, Form, Button, Col, Row, Input, Select, DatePicker, Icon, Upload, Tooltip
} from 'antd'
const _ = require('lodash')
const TextArea = Input.TextArea

@inject('app', 'auth', 'project')
@withRouter
@observer
class EditProjectFormDrawer extends React.Component {

  validate = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          console.log('Resolving with values', values)
          resolve(values)
        }
        reject(err)
      });
    })
  }

  submit = async e => {
    e.preventDefault()
    try {
      const data = await this.validate()
      console.log('Requesting participation with data', data)
      await this.props.project.edit(this.props.project.currentProject.id, data, () => this.props.project.showEditForm = false)
    } catch (e) {
      console.log('Err', e)
      const validationErr = _.at(e, 'response.data.err')[0]
      if (validationErr) {
        console.log(`Error at validation in request participation`, validationErr)
        this.props.project.error = validationErr
        this.timeout = setTimeout(() => this.props.project.error = '', 2500)
      }
      // noop
    }
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout)
  }

  render() {
    const { project, app, auth } = this.props
    const { getFieldDecorator } = this.props.form;
    const uploadButton = (
      <div>
        <Icon type={project.loadingAvatar ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Загрузить</div>
      </div>
    );
    return (
      <Drawer
        destroyOnClose
        title={<Button onClick={() => project.showEditForm = false}>Закрыть</Button>}
        width={360}
        onClose={() => project.showEditForm = false}
        visible={project.showEditForm}
        style={{
          overflow: 'auto',
          height: 'calc(100% - 108px)',
          paddingBottom: '108px',
        }}
      >
        <h1>Редактирование проекта</h1>

        <Tooltip
          placement="topLeft"
          title={'Разрешенные форматы: .gif, .jpeg, .jpg, .png, файлы больше 1мб не гружу'}
        >
          <div style={{ width: 170 }}>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              style={{
                width: 150,
                height: 150
              }}
              showUploadList={false}
              beforeUpload={file => {
                console.log(`File`, file)
                project.uploadAvatar(file, project.currentProject.id)
                return false
              }}
              onChange={info => {
                if (info.file.status === 'uploading') {
                  project.loadingAvatar = true
                }
                if (info.file.status === 'done') project.loadingAvatar = false
              }}
            >
              {
                project.currentProject && project.currentProject.avatar_url ?
                  <img src={project.currentProject.avatar_url} alt="avatar" />
                  : uploadButton
              }
            </Upload>
          </div>
        </Tooltip>

        <Form layout="vertical" hideRequiredMark onSubmit={this.submit}>
          <Form.Item label="Краткое описание">
            {getFieldDecorator('title', {
              initialValue: project.currentProject.title,
              rules: [
                { required: true, message: 'Обязательное поле' },
                { max: 70, message: 'Не больше 70 символов' }
              ],
            })(<Input placeholder="Не более 30 символов" />)}
          </Form.Item>
          <Form.Item label={'О себе и скиллах'}>
            {getFieldDecorator('description', {
              initialValue: project.currentProject.description,
              rules: [
                { required: true, message: 'Поле пустое' },
                { max: 2000, message: 'Не больше 2000 символов' },
              ],
            })(
              <TextArea
                autosize={{ minRows: 6 }}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)', minHeight: 120 }} />}
                placeholder="Подробное описание (до 2k символов)"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              disabled={project.loading || project.loadingAvatar}
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ marginRight: 10 }}
            >
              Отправить
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    )
  }
}

export default Form.create()(EditProjectFormDrawer)