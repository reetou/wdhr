import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Button, Checkbox, List, Avatar, Spin,
} from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
const _ = require('lodash')

const IconText = ({ type, text, rated, onClick }) => (
  <span style={rated ? { color: 'green' } : {}} onClick={onClick}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

@inject('app', 'auth', 'article')
@withRouter
@observer
export default class AllArticles extends React.Component {

  componentDidMount() {
    if (!this.props.article.cursor) {
      this.props.article.loadAll()
    }
  }

  render() {
    const app = this.props.app
    const auth = this.props.auth
    const article = this.props.article
    const loadMore = !article.loading && article.hasMore ? (
      <div style={{
        textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px',
      }}
      >
        <Button onClick={article.loadAll}>Еще</Button>
      </div>
    ) : null
    return (
      <div style={{ padding: 24, background: '#fff', height: 690, overflow: 'auto' }}>
        <h1>Статьи <Button onClick={article.loadAll}>{article.hasMore ? 'Подгрузить еще' : 'Загрузить заново'}</Button></h1>
        <List
          loadMore={loadMore}
          itemLayout={'vertical'}
          dataSource={article.sortedArticles}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <IconText
                  type="like-o"
                  text={item.rating}
                  rated={auth.user.rated_articles.includes(Number(item.id))}
                  onClick={() => article.rate(Number(item.id), auth.user.rated_articles.includes(Number(item.id)))}
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
          {article.loading && (
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Spin />
            </div>
          )}
        </List>
      </div>
    )
  }
}
