import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Form, Icon, Input, Button, Checkbox, Select, InputNumber, Layout
} from 'antd'
const _ = require('lodash')

const FormItem = Form.Item;
const TextArea = Input.TextArea
const Option = Select.Option

@inject('app', 'auth', 'project')
@withRouter
@observer
class CreateProject extends React.Component {

  validate = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
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
      await this.props.project.create(data)
    } catch (e) {
      console.log('Err', e)
      const validationErr = _.at(e, 'response.data.err')[0]
      if (validationErr) {
        this.props.project.error = validationErr
        this.timeout = setTimeout(() => this.props.project.error = '', 2500)
      }
      // noop
    }
  }
  render() {
    const app = this.props.app
    const auth = this.props
    const project = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <Layout style={{ backgroundColor: '#fff', padding: 24 }}>
        <h2>{project.loading ? 'Гружу...' : 'Создаем проект'}</h2>
        { this.props.auth.error ? <h4 style={{ color: 'red' }}>{this.props.auth.error}</h4> : null }
        <Form onSubmit={this.submit}>
          <FormItem>
            {getFieldDecorator('name', {
              rules: [
                { required: false, message: 'Название обязательно' },
                { max: 15, message: 'Не больше 15 символов' },
                { whitespace: true, message: 'Без пробелов' }
              ],
            })(
              <Input placeholder="Название проекта" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('title', {
              rules: [
                { required: false, message: 'Поле пустое' },
                { max: 70, message: 'Не больше 70 символов' },
              ],
            })(
              <Input placeholder="Краткое описание" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('description', {
              rules: [
                { required: false, message: 'Поле пустое' },
                { max: 1000, message: 'Не больше 1000 символов' },
              ],
            })(
              <TextArea autosize={{ minRows: 6 }} prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)', minHeight: 120 }} />} placeholder="Подробное описание (до тысячи символов)" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('type', {
              rules: [
                { required: false, message: 'Выбери тип' },
              ],
            })(
              <Select defaultValue="1" style={{ width: 120 }}>
                <Option value="1">FRONTEND</Option>
                <Option value="2">BACKEND</Option>
              </Select>
            )}
          </FormItem>
          <FormItem>
            <div>Бюджет</div>
            {getFieldDecorator('budget', {
              rules: [
                { required: false, message: 'Поле пустое' },
              ],
            })(
              <InputNumber
                defaultValue={100}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            )}
          </FormItem>
          <FormItem>
            <div>Сроки (в днях)</div>
            {getFieldDecorator('estimates', {
              rules: [
                { required: false, message: 'Поле пустое' },
              ],
            })(
              <InputNumber
                defaultValue={30}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('is_public', {
              rules: [
              ],
            })(
              <Checkbox>Публичный</Checkbox>
            )}
          </FormItem>
          <FormItem>
            <Button disabled={this.props.auth.loading} type="primary" htmlType="submit" className="login-form-button" style={{ marginRight: 10 }}>
              Создать
            </Button>
          </FormItem>
        </Form>
      </Layout>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(CreateProject);
export default WrappedNormalLoginForm
