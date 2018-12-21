import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Row, Card, Col
} from 'antd'
import { withRouter } from 'react-router-dom'
const _ = require('lodash')

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
    const lg = 12
    const md = 12
    const sm = 12
    const xs = 24
    if (_.isEmpty(auth.user)) return <div />
    return (
      <Row>
        <Col xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            title={<CardHeadTitle title={'ПРОЕКТОВ ЛАЙКНУТО'} />}
            bordered={false}
            bodyStyle={cardBodyStyle}
          >
            {auth.user.rated ? auth.user.rated.length : '0'}
          </Card>
        </Col>
        <Col xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            title={<CardHeadTitle title={'ПРОЕКТОВ СОЗДАНО'} />}
            bordered={false}
            bodyStyle={cardBodyStyle}
          >
            {auth.user.project_ownership_count}
          </Card>
        </Col>
      </Row>
    )
  }

}