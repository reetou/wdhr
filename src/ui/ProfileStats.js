import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Row, Card, Col
} from 'antd'
import { withRouter } from 'react-router-dom'
import UIAvatar from "../ui/Avatar"

const CardHeadTitle = ({ title }) => <div
  style={{
    textOverflow: 'unset',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  }}
>
  {title}
</div>

@inject('app', 'auth', 'article', 'project')
@withRouter
@observer
export default class ProfileStats extends React.Component {

  render() {
    const cardBodyStyle = {
      textAlign: 'center',
      fontSize: 24,
    }
    const { auth, app, project, article } = this.props
    const lg = 6
    const md = 8
    const sm = 12
    const xs = 24
    return (
      <Row>
        <Col xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            title={<CardHeadTitle title={'ПРОЕКТОВ ЛАЙКНУТО'} />}
            bordered={false}
            bodyStyle={cardBodyStyle}
          >
            {auth.user.rated.length}
          </Card>
        </Col>
        <Col xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            headStyle={{
              textOverflow: 'unset',
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
            }}
            title={<CardHeadTitle title={'СТАТЕЙ ЛАЙКНУТО'} />}
            bordered={false}
            bodyStyle={cardBodyStyle}
          >
            {auth.user.rated_articles.length}
          </Card>
        </Col>
        <Col xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            title={<CardHeadTitle title={'ПРОЕКТОВ СОЗДАНО'} />}
            bordered={false}
            bodyStyle={cardBodyStyle}
          >
            {project.userProjects.length}
          </Card>
        </Col>
        <Col xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            title={<CardHeadTitle title={'СТАТЕЙ НАПИСАНО'} />}
            bordered={false}
            bodyStyle={cardBodyStyle}
          >
            {article.userArticles.length}
          </Card>
        </Col>
      </Row>
    )
  }

}