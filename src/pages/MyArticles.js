import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar
} from 'antd';
import * as _ from 'lodash'


const IconText = ({ type, text, rated, onClick }) => (
  <span style={onClick ? { color: '#40a9ff' } : {}} onClick={onClick}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

@inject('app', 'auth', 'article')
@withRouter
@observer
export default class MyArticles extends React.Component {

  render() {
    const app = this.props.app
    const auth = this.props.auth
    const article = this.props.article
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>
          <span style={{ marginRight: 10 }}>Мои статьи</span>
          <Button disabled={article.loading} style={{ marginRight: 10 }} onClick={() => this.props.history.push('/myarticles/create')}>Новая статья</Button>
          <Button disabled={article.loading} style={{ marginRight: 10 }} onClick={article.loadUserArticles}>{article.userArticles.length ? 'Обновить' : 'Загрузить'}</Button>
        </h1>
        <List
          itemLayout={'vertical'}
          dataSource={article.sortedUserArticles}
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
                  onClick={() => article.remove(item.id)}
                />,
                <IconText
                  onClick={() => article.edit(item.id, { is_public: !item.is_public })}
                  type={item.is_public ? 'unlock' : 'lock'}
                  text={item.is_public ? 'Публичный' : 'Приватный'}
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                title={<a>{item.title}</a>}
                description={item.type.join(', ')}
              />
              <div>{_.at(item, 'content')[0] ? item.content.substring(0, 100) : ''}...</div>
            </List.Item>
          )}
        >
          {article.loading ? (
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Spin />
            </div>
          ) : null}
        </List>
      </div>
    )
  }
}
