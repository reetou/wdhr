import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar
} from 'antd';
import BookOpenAnimation from "../ui/BookOpenAnimation"
import ProjectItem from "../ui/ProjectItem"
import * as _ from 'lodash'


const IconText = ({ type, text, rated, onClick }) => (
  <div className={onClick ? 'primary_icon' : ''} onClick={onClick}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </div>
);

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class MyProjects extends React.Component {

  componentDidMount() {
    this.props.project.loadUserProjects()
  }

  goToProject = project => {
    this.props.project.currentProject = project
    this.props.history.push(`/projects/${project.id}`)
  }

  render() {
    const project = this.props.project
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>
          <span style={{ marginRight: 10 }}>Мои проекты</span>
          <Button disabled={project.loading} style={{ marginRight: 10 }} onClick={() => this.props.history.push('/myprojects/create')}>Новый проект</Button>
          <Button disabled={project.loading} style={{ marginRight: 10 }} onClick={project.loadUserProjects}>{project.loading ? 'Гружу...' : project.userProjects.length ? 'Обновить' : 'Загрузить'}</Button>
        </h1>
        <List
          itemLayout={'vertical'}
          dataSource={project.sortedUserProjects}
          renderItem={item => (
            <ProjectItem
              item={item}
              actions={[
                <IconText
                  type="like-o"
                  text={item.rating}
                />,
                <IconText
                  type="team"
                  text={item.members_count}
                />,
                <IconText
                  type={'delete'}
                  text={'Удалить'}
                  onClick={() => project.remove(item.project_id)}
                />,
                <IconText
                  onClick={() => project.edit(item.project_id, { is_public: !item.is_public })}
                  type={item.is_public ? 'unlock' : 'lock'}
                  text={item.is_public ? 'Публичный' : 'Приватный'}
                />
              ]}
            />
          )}
        >
          {project.loading ? (
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <BookOpenAnimation/>
            </div>
          ) : null}
        </List>
      </div>
    )
  }
}
