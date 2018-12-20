import PusherClient from 'pusher-js';
import * as React from 'react'
import config from '../core/config'
import { Button, notification } from "antd"

// Enable pusher logging - don't include this in production
PusherClient.logToConsole = true;

console.log(`Config`, config)

class Pusher {

  constructor() {
    this.pusher = null
  }

  init(login, key) {
    if (this.pusher) {
      this.pusher.unsubscribe(`user_${login}`)
      this.pusher = null
    }
    console.log(`CLUSTER: ${config.PUSHER.cluster}`)
    this.pusher = new PusherClient(key, {
      cluster: config.PUSHER.cluster,
      encrypted: true
    });
    const ev = config.PUSHER.EVENTS

    const channel = this.pusher.subscribe(`user_${login}`);
    channel.bind(ev.PROJECT_PARTICIPATION_ACCEPT, data => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button type="primary" size="small" onClick={() => notification.close(key)}>
          OK
        </Button>
      );
      notification.open({
        message: 'Заявка одобрена',
        description: `Теперь вы участник проекта ${data.name}`,
        btn,
        duration: 0,
        key,
      });
      console.log(`Participation accepted`, data)
    });

    channel.bind(ev.PROJECT_PARTICIPATION_REJECT, data => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button type="primary" size="small" onClick={() => notification.close(key)}>
          OK :(
        </Button>
      );
      notification.open({
        message: 'Заявка отклонена',
        description: `Заявка в проект ${data.name} отклонена. Причина: ${data.reason || 'Не указана'}`,
        btn,
        duration: 0,
        key,
      });
      console.log(`Participation declined :C`, data)
    })

    channel.bind(ev.PROJECT_RATE, data => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button type="primary" size="small" onClick={() => notification.close(key)}>
          Круто!
        </Button>
      );
      notification.open({
        message: 'Проект оценен',
        description: `Пользователь ${data.login} посчитал интересным проект ${data.name}`,
        btn,
        duration: 0,
        key,
      });
      console.log(`Someone rated project`, data)
    })

    channel.bind(ev.PROJECT_RATE_REVERT, data => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button type="primary" size="small" onClick={() => notification.close(key)}>
          Круто!
        </Button>
      );
      notification.open({
        message: 'Проект не интересует',
        description: `Пользователь ${data.login} больше не считает интересным ваш проект ${data.name}`,
        btn,
        duration: 0,
        key,
      });
      console.log(`Project rate reverted`, data)
    })

    channel.bind(ev.PROJECT_PARTICIPATION_REQUEST, data => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button type="primary" size="small" onClick={() => notification.close(key)}>
          Круто!
        </Button>
      );
      notification.open({
        message: 'Заявка на участие',
        description: `Пользователь ${data.login} желает присоединиться к проекту ${data.name}`,
        btn,
        duration: 0,
        key,
      });
      console.log(`Someone requested participation`, data)
    })

    channel.bind(ev.PARTICIPATOR_JOIN, data => {
      console.log(`Participator joined`, data)
    })

    channel.bind(ev.PARTICIPATOR_LEAVE, data => {
      console.log(`Participator left`, data)
    })
  }

}

export default new Pusher()