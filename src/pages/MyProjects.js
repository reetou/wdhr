import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar
} from 'antd';
const _ = require('lodash')


const IconText = ({ type, text, rated, onClick }) => (
  <span style={onClick ? { color: '#40a9ff' } : {}} onClick={onClick}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class MyProjects extends React.Component {

  render() {
    const app = this.props.app
    const auth = this.props.auth
    const project = this.props.project
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>
          <span style={{ marginRight: 10 }}>Мои проекты</span>
          <Button style={{ marginRight: 10 }} onClick={() => this.props.history.push('/myprojects/create')}>Новый проект</Button>
          <Button style={{ marginRight: 10 }} onClick={project.loadUserProjects}>{project.userProjects.length ? 'Обновить' : 'Загрузить'}</Button>
        </h1>
        <List
          itemLayout={'vertical'}
          dataSource={project.sortedUserProjects}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <IconText
                  type="like-o"
                  text={item.rating}
                />,
                <IconText
                  type={'delete'}
                  text={'Удалить'}
                  onClick={() => project.remove(item.id)}
                />,
                <IconText
                  onClick={() => project.edit(item.id, { is_public: !item.is_public })}
                  type={item.is_public ? 'unlock' : 'lock'}
                  text={item.is_public ? 'Публичный' : 'Приватный'}
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                title={<a>{item.name}</a>}
                description={item.title}
              />
              <div>{item.description.substring(0, 100)}...</div>
            </List.Item>
          )}
        >
          {project.loading ? (
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Spin />
            </div>
          ) : null}
        </List>
      </div>
    )
  }
}
