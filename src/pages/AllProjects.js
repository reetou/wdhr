import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Button, Checkbox, List, Avatar, Spin,
} from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import ProjectItem from "../ui/ProjectItem"
const _ = require('lodash')

const IconText = ({ type, text, rated, onClick, inactiveColor }) => (
  <span style={{
    ...inactiveColor ? { color: '#40a9ff' } : {},
    ...rated ? { color: 'green' } : {  }
  }} onClick={onClick}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class AllProjects extends React.Component {

  componentDidMount() {
    if (!this.props.project.cursor && this.props.auth.loggedIn) {
      this.props.project.loadAll()
    }
  }

  goToProject = project => {
    this.props.project.currentProject = project
    this.props.history.push(`/projects/${project.id}`)
  }

  render() {
    const app = this.props.app
    const auth = this.props.auth
    const project = this.props.project
    const loadMore = !project.loading && project.hasMore ? (
      <div style={{
        textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px',
      }}
      >
        <Button onClick={project.loadAll}>Еще</Button>
      </div>
    ) : null
    return (
      <div style={{ padding: 24, background: '#fff', height: 690, overflow: 'auto' }}>
        <h1>Проекты <Button onClick={project.loadAll} disabled={project.loading}>{project.hasMore ? 'Подгрузить еще' : 'Загрузить заново'}</Button></h1>
        <List
          loadMore={loadMore}
          itemLayout={'vertical'}
          dataSource={project.sortedProjects}
          renderItem={item => (
            <ProjectItem
              actions={[
                <IconText
                  inactiveColor
                  type="like-o"
                  text={item.rating}
                  rated={auth.user.rated.includes(Number(item.id))}
                  onClick={() => project.rate(Number(item.id), auth.user.rated.includes(Number(item.id)))}
                />,
                <IconText
                  type="team"
                  text={item.members}
                />
              ]}
              item={item}
            />
          )}
        >
          {project.loading && (
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Spin />
            </div>
          )}
        </List>
      </div>
    )
  }
}
