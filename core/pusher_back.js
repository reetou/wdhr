const PusherClient = require('pusher')
const config = require('../core/config')

// Enable pusher logging - don't include this in production
PusherClient.logToConsole = true;

const p = new PusherClient({
  appId: config.PUSHER.APP_ID,
  key: config.PUSHER.KEY,
  secret: config.PUSHER.SECRET,
  cluster: config.PUSHER.cluster || 'eu',
  encrypted: true
});
const ev = config.PUSHER.EVENTS

class Pusher {

  constructor() {
    this.pusher = p
  }

  participationAccept(login, data) {
    this.pusher.trigger(`user_${login}`, ev.PROJECT_PARTICIPATION_ACCEPT, data)
  }

  participationReject(login, data) {
    this.pusher.trigger(`user_${login}`, ev.PROJECT_PARTICIPATION_REJECT, data)
  }

  projectRate(login, data) {
    this.pusher.trigger(`user_${login}`, ev.PROJECT_RATE, data)
  }

  projectRateRevert(login, data) {
    this.pusher.trigger(`user_${login}`, ev.PROJECT_RATE_REVERT, data)
  }

  projectParticipationRequest(login, data) {
    this.pusher.trigger(`user_${login}`, ev.PROJECT_PARTICIPATION_REQUEST, data)
  }

  projectBundleVisit(login, data) {
    this.pusher.trigger(`user_${login}`, ev.PROJECT_VISIT, data)
  }

  participatorJoin(projectId, data) {
    console.log(`Participator join news`)
  }

  participatorLeave(projectId, data) {
    console.log(`Participator leave news`)
  }

}

module.exports = new Pusher()