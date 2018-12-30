import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import {
  Form, Icon, Input, Button, Checkbox, Select, InputNumber, Layout
} from 'antd'
import * as mobxUtils from 'mobx-utils'
import * as Rx from "rxjs/Rx"
import {
  Stage, Layer, Rect, Text, Image, FastLayer, Sprite
} from 'react-konva'

const stuff = {
  sky: require('../img/animations/castle/sky.png'),
  stars: require('../img/animations/castle/stars.png'),
  gate: require('../img/animations/castle/gate.png'),
  clouds: require('../img/animations/castle/clouds.png'),
  castle_back: require('../img/animations/castle/castle_back.png'),
  castle_front: require('../img/animations/castle/castle_front.png'),
  bridge_static_back: require('../img/animations/castle/bridge_static_back.png'),
  bridge_static_front: require('../img/animations/castle/bridge_static_front.png'),
  bridge_front: require('../img/animations/castle/bridge_front_cut.png'),
  floor: require('../img/animations/castle/floor_cut.png'),
  columns: require('../img/animations/castle/columns.png'),
  trees: require('../img/animations/castle/trees_cut.png'),
  rider_move: require('../img/animations/rider/rider.png'),
  bridge_move: require('../img/animations/bridge/bridge_sprite.png'),
}


@inject('app', 'auth')
@observer
export default class RiderAnimation extends React.Component {

  riderNode;
  rider_default_x = 575;
  rider_default_y = 379;
  frameListener;
  bridgeFrameListener;
  maximumRiderMoveX = 185 * 2 - 30;
  riderObs;
  @computed get shouldRaiseBridge() {
    return this.rider.x <= this.maximumRiderMoveX + 15
  }
  @computed get shouldStopRider() {
    return this.rider.x <= this.maximumRiderMoveX
  }
  @observable pointCursor = false
  @observable background = {
    sky: null,
    stars: null,
    clouds: null,
    floor: null,
    trees: null
  }
  @observable castle = {
    front: null,
    back: null,
    columns: null,
    gate: null,
  }
  @observable bridge = {
    frameIndex: 0,
    move: null,
    front: null,
    front_cut: null,
    back: null,
  }
  @observable rider = {
    x: this.rider_default_x,
    y: this.rider_default_y,
    move: null,
  }
  @observable bridgeUp = false
  @observable climbUp = false
  bridgeBackNode
  bridgeFrontNode

  initSprites = () => {
    this.img(`sky`, stuff.sky, data => this.background.sky = data)
    this.img(`stars`, stuff.stars, data => this.background.stars= data)
    this.img(`clouds`, stuff.clouds, data => this.background.clouds = data)
    this.img(`castle_back`, stuff.castle_back, data => this.castle.back = data)
    this.img(`castle_front`, stuff.castle_front, data => this.castle.front = data)
    this.img(`columns`, stuff.columns, data => this.castle.columns = data)
    this.img(`gate`, stuff.gate, data => this.castle.gate = data)
    this.img(`bridge_back`, stuff.bridge_static_back, data => this.bridge.back = data)
    this.img(`rider_move`, stuff.rider_move, data => this.rider.move = data)
    this.img(`bridge_move`, stuff.bridge_move, data => this.bridge.move = data)
    this.img(`bridge_front`, stuff.bridge_static_front, data => this.bridge.front = data)
    this.img(`bridge_front_cut`, stuff.bridge_front, data => this.bridge.front_cut = data)
    this.img(`floor`, stuff.floor, data => this.background.floor = data)
    this.img(`trees`, stuff.trees, data => this.background.trees = data)
  }
  componentDidMount() {
    this.initSprites()
    this.riderNode.start()
    console.log(`Rider node`, this.riderNode)
    this.frameListener = () => {
      if (this.rider.x >= this.maximumRiderMoveX) {
        this.rider.x -= 4
      }
    }
    this.riderNode.addEventListener('frameIndexChange', this.frameListener)
    this.bridgeUpObs = Rx.Observable
      .defer(() => Rx.Observable
        .timer(0, 100)
      )
    this.riderFall = Rx.Observable
      .defer(() => Rx.Observable
        .timer(0, 100)
      )
    const fallSub = () => {
      const s = this.riderFall.subscribe(frame => {
        this.riderNode.animation('stop')
        if (frame < 4) {
          this.riderNode.frameIndex(0)
          this.rider.y = this.rider_default_y - 20
        }
        if (frame > 4 && frame < 6) {
          this.riderNode.frameIndex(1)
          this.rider.y += 60
        }
        if (frame >= 6) {
          this.riderNode.animation('fall')
          this.riderNode.start()
          this.rider.y += 10
          if (this.rider.y >= 500) this.climbUp = false
        }
        if (this.rider.y > 600) {
          s.unsubscribe()
          this.rider.y = this.rider_default_y
          this.rider.x = this.rider_default_x
          this.riderNode.animation('move')
        }
      })
    }
    const sub = () => {
      const s = this.bridgeUpObs.subscribe(frame => {
        if (this.climbUp && this.bridge.frameIndex < 5) {
          if (frame >= 30) this.climbUp = false
          return this.bridge.frameIndex = frame
        }
        if (this.climbUp) return
        const nextFrame = this.bridge.frameIndex - 1
        if (nextFrame < 0) {
          this.bridge.frameIndex = 0
          this.bridgeUp = false
          this.climbUp = false
          return s.unsubscribe()
        }
        this.bridge.frameIndex -= 1
      })
    }
    const riderStream = mobxUtils.toStream(() => this.rider.x, true)
    const riderStopSignal = new Rx.Subject()
    this.riderObs = Rx.Observable
      .from(riderStream)
      .subscribe(
        v => {
          console.log(`X`, v)
          if (this.shouldStopRider) {
            console.log(`Stop rider`)
            if (this.riderNode) this.riderNode.stop()
            riderStopSignal.next()
            fallSub()
          }
          if (this.shouldRaiseBridge && !this.bridgeUp) {
            console.log(`Bridge up`)
            this.bridgeUp = true
            this.climbUp = true
            sub()
          }
        },
        error => {},
        () => {
          console.log(`Complete!`)
        }
      )
    this.riderNode.on('mouseenter', () => {
      if (this.rider_default_x - this.rider.x >= 80) {
        this.pointCursor = true
      }
    })
    this.riderNode.on('mouseleave', () => {
      this.pointCursor = false
    })
  }

  componentWillUnmount() {
    this.riderNode.removeEventListener('frameIndexChange', this.frameListener)
    if (this.riderObs) this.riderObs.unsubscribe()
  }

  riderClick = () => {
    this.rider.x = this.rider_default_x
    if (!this.riderNode.isRunning()) this.riderNode.start()
  }

  img = (name, url, cb) => {
    const image = new window.Image();
    image.src = url
    image.onload = () => {
      console.log(`Loaded ${name}: ${url}`)
      if (cb) cb(image)
    }
  }
  bridgeBackAnimation = [
    0,0,126,122,
    0,122,126,122,
    0,122 * 2,126,122,
    0,122 * 3,126,122,
    0,122 * 4,126,122,
    0,122 * 5,126,122,
  ]
  bridgeFrontAnimation = [
    0,122*6,126,122,
    0,122*7,126,122,
    0,122*8,126,122,
    0,122*9,126,122,
    0,122*10,126,122,
    0,122*11,126,122,
  ]

  render() {
    return (
      <Stage
        style={{
          cursor: this.pointCursor ? 'pointer' : 'default',
          width: 800
        }}
        width={800}
        height={600}
      >
        <Layer>
          <Image image={this.background.sky} />
          <Image image={this.background.stars} />
          <Image image={this.background.clouds} />
          <Image image={this.castle.back} />
          <Image image={this.castle.front} />
          <Image image={this.castle.columns} />
          <Image image={this.castle.gate} />
          <Image image={this.bridge.back} />
          <Image image={this.bridge.front} />
        </Layer>
        <Layer>
          <Sprite
            name={'bridgeBackSprite'}
            x={172 + 126}
            y={201 + 122}
            image={this.bridge.move}
            animations={{
              move_up: this.bridgeBackAnimation,
              // move_down: this.bridgeBackAnimation.reverse()
            }}
            onClick={() => console.log(`bridge node click`)}
            animation={'move_up'}
            frameRate={4}
            ref={node => this.bridgeBackNode = node}
            frameIndex={this.bridge.frameIndex}
          />
          <Sprite
            name={'bridgeFrontSprite'}
            x={140 + 126}
            y={201 + 122}
            image={this.bridge.move}
            animations={{
              move_up: this.bridgeFrontAnimation,
              // move_down: this.bridgeFrontAnimation.reverse()
            }}
            onClick={() => console.log(`bridge node click`)}
            animation={'move_up'}
            frameRate={6}
            ref={node => this.bridgeFrontNode = node}
            frameIndex={this.bridge.frameIndex}
          />
          <Image image={this.background.floor} y={600 - 151} />
          <Sprite
            name={'riderSprite'}
            x={this.rider.x}
            y={this.rider.y}
            image={this.rider.move}
            animations={{
              move: [
                0,0,80,80,
                0,80,80,80,
                0,160,80,80,
                0,240,80,80,
              ],
              stop: [
                0,300,80,90,
                0,360,80,40,
              ],
              fall: [
                0, 560, 80,80,
                0, 480, 80,80
              ]
            }}
            onClick={this.riderClick}
            animation={'move'}
            frameRate={6}
            ref={node => this.riderNode = node}
            frameIndex={0}
          />
          <Image image={this.bridge.front_cut} y={223 * 2 - 39} x={368} />
        </Layer>
        <Layer>
          <Image image={this.background.trees} y={600 - 232 - 152} x={800 - 100} />
        </Layer>
      </Stage>
    )
  }
}