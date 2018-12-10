import { observable } from 'mobx'
import AppStore from './AppStore'
import AuthStore from './AuthStore'
import ProjectStore from './ProjectStore'

function createStores() {
  const app = new AppStore();
  const auth = new AuthStore(app);
  const project = new ProjectStore(app, auth)
  const s = observable({
    app,
    auth,
    project
  });

  return s;
}

export default createStores