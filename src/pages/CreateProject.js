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
      if (data.type && !Array.isArray(data.type)) data.type = [data.type]
      console.log('Going with data', data)
      await this.props.project.create(_.cloneDeep(data))
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
    const auth = this.props.auth
    const project = this.props.project
    const { getFieldDecorator } = this.props.form
    return (
      <Layout style={{ backgroundColor: '#fff', padding: 24 }}>
        <h2>{project.loading ? 'Гружу...' : 'Создаем проект'}</h2>
        { this.props.auth.error ? <h4 style={{ color: 'red' }}>{this.props.auth.error}</h4> : null }
        <Form onSubmit={this.submit}>
          <FormItem>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: 'Название обязательно' },
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
                { required: true, message: 'Поле пустое' },
                { max: 70, message: 'Не больше 70 символов' },
              ],
            })(
              <Input placeholder="Краткое описание" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: 'Поле пустое' },
                { max: 1000, message: 'Не больше 1000 символов' },
              ],
            })(
              <TextArea autosize={{ minRows: 6 }} prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)', minHeight: 120 }} />} placeholder="Подробное описание (до тысячи символов)" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('type', {
              rules: [
                { required: true, message: 'Выбери хотя бы одно направление' },
              ],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Направления"
                defaultValue={[]}
                onChange={val => console.log('Val', val)}
              >
                {
                  [{ name: 'FRONTEND', value: 1 }, { name: 'BACKEND', value: 2 }]
                    .map(i => <Option key={i.value}>{i.name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem>
            <div>Бюджет</div>
            {getFieldDecorator('budget', {
              rules: [
                { validator: (rule, value, cb) => {
                    const valid = Number(value) >= 0 && Number(value) <= 3000
                    console.log('value', value)
                    cb(valid ? [] : [new Error('Минимум 0 даларов и максимум 3000')])
                    return valid
                  } },
                { required: true, message: 'Поле пустое' },
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
                { validator: (rule, value, cb) => {
                    const valid = Number(value) >= 1
                    cb(valid ? [] : [new Error('Минимум 1 день')])
                    return valid
                  } },
                { required: true, message: 'Поле пустое' },
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
