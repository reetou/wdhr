import { observable } from 'mobx'
import AppStore from './AppStore'
import AuthStore from './AuthStore'
import ProjectStore from './ProjectStore'
import ArticleStore from './ArticleStore'

function createStores() {
  const app = new AppStore();
  const auth = new AuthStore(app);
  const project = new ProjectStore(app, auth)
  const article = new ArticleStore(app, auth)
  const s = observable({
    app,
    auth,
    project,
    article
  });

  return s;
}

export default createStores