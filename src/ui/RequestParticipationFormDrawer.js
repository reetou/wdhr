import React from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import {
  Drawer, Form, Button, Col, Row, Input, Select, DatePicker, Icon,
} from 'antd';
import * as _ from 'lodash'
const TextArea = Input.TextArea

@inject('app', 'auth', 'project')
@withRouter
@observer
class RequestParticipationFormDrawer extends React.Component {

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
      await this.props.project.requestParticipation(this.props.project.currentProject.id, data)
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
    return (
      <Drawer
        destroyOnClose
        title={<Button onClick={() => project.showParticipationForm = false }>Закрыть</Button>}
        width={360}
        onClose={() => project.showParticipationForm = false}
        visible={project.showParticipationForm}
        style={{
          overflow: 'auto',
          height: 'calc(100% - 108px)',
          paddingBottom: '108px',
        }}
      >
        <h1>Форма на участие боййй</h1>
        <Form layout="vertical" hideRequiredMark onSubmit={this.submit}>
          <Form.Item label="Позиция">
            {getFieldDecorator('position', {
              rules: [
                { required: true, message: 'Введи свою позицию в проекте, типа фронтендер или кто ты там' },
                { max: 30, message: 'Ты там поэму строчишь или что? 30 символов, не больше' }
              ],
            })(<Input placeholder="Кем хочешь быть в проекте" />)}
          </Form.Item>
          <Form.Item label={'О себе и скиллах'}>
            {getFieldDecorator('comment', {
              initialValue: '',
              rules: [
                { required: true, message: 'Поле пустое' },
                { max: 2000, message: 'Не больше 2000 символов' },
              ],
            })(
              <TextArea
                autosize={{ minRows: 6 }}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)', minHeight: 120 }} />}
                placeholder="Напиши о себе и своих скиллах, почему решил участвовать в проекте и все такое"
              />
            )}
          </Form.Item>
          <Form.Item label="Позиция">
            {getFieldDecorator('contacts.telegram', {
              rules: [
                { required: true, message: 'Как с тобой связаться-то, подельник?' },
                { max: 30, message: 'Это точно телега?' }
              ],
            })(<Input placeholder="Телеграм без собачки" />)}
          </Form.Item>
          <Form.Item>
            <Button
              disabled={project.participationLoading}
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

export default Form.create()(RequestParticipationFormDrawer)