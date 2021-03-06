import React from 'react'
import { observer, inject } from 'mobx-react'
import {
  Form, Icon, Input, Button, Checkbox, Select, InputNumber, Layout
} from 'antd'
import * as _ from 'lodash'

const FormItem = Form.Item;
const TextArea = Input.TextArea
const Option = Select.Option

@inject('app', 'auth', 'article')
@observer
class CreateArticle extends React.Component {

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
      await this.props.article.create(data)
    } catch (e) {
      console.log('Err', e)
      const validationErr = _.at(e, 'response.data.err')[0]
      if (validationErr) {
        this.props.article.error = validationErr
        this.timeout = setTimeout(() => this.props.article.error = '', 2500)
      }
      // noop
    }
  }
  render() {
    const app = this.props.app
    const auth = this.props.auth
    const article = this.props.article
    const { getFieldDecorator } = this.props.form
    return (
      <Layout style={{ backgroundColor: '#fff', padding: 24 }}>
        <h2>{article.loading ? 'Гружу...' : 'Создаем статью'}</h2>
        { this.props.auth.error ? <h4 style={{ color: 'red' }}>{this.props.auth.error}</h4> : null }
        <Form onSubmit={this.submit}>
          <FormItem>
            {getFieldDecorator('title', {
              rules: [
                { required: true, message: 'Поле пустое' },
                { max: 40, message: 'Не больше 40 символов' },
              ],
            })(
              <Input placeholder="Заголовок" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('content', {
              rules: [
                { required: true, message: 'Как ты статью собрался писать, если тут пусто? Ты дурной?' },
                { max: 1000, message: 'Не больше 1000 символов' },
              ],
            })(
              <TextArea autosize={{ minRows: 6 }} prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)', minHeight: 120 }} />} placeholder="Текст" />
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
            {getFieldDecorator('is_public', {
              rules: [
              ],
            })(
              <Checkbox>Публичная</Checkbox>
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

const WrappedNormalLoginForm = Form.create()(CreateArticle);
export default WrappedNormalLoginForm
