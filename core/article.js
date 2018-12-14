const db = require('./db')
const sha1 = require('sha1')
const _ = require('lodash')
const { AUTH } = require('./config')
const shortID = require('shortid')
const logError = require('debug')('article:error')

class Article {
  
  constructor() {
    this.ALLOWED_EDIT_PROPS = ['title', 'content', 'is_public']
    this.CREATE_PROPS = {
      title: 'string',
      content: 'string',
      type: 'array',
      is_public: 'boolean'
    }
  }

  async get(cursor = 0, asc = true) {
    const data = await db.scanHash('articles', cursor)
    const updatedCursor = data[0]
    let articles = data[1].filter(v => typeof JSON.parse(v) === 'object')
    articles = await Promise.all(_.map(articles, async p => {
      const article = JSON.parse(p)
      return {
        ...article,
        rating: await this.getRating(article.id)
      }
    }))
    articles = _.sortBy(articles, 'date')
    if (!asc) articles = articles.reverse()
    return { articles: articles.filter(a => a.is_public), cursor: updatedCursor }
  }

  async getUserArticles(login) {
    let articles = await db.findAllInHash(`articles_${login}`)
    if (!articles) return []
    return await Promise.all(_.map(articles, async p => {
      const article = JSON.parse(p)
      return {
        ...article,
        rating: await this.getRating(article.id)
      }
    }))
  }

  async uprate(id, login) {
    if (!id || !login) return
    await db.addToHash(`article_${id}_rating`, login, JSON.stringify({
      date: Date.now(),
      login,
    }))
    await db.addToHash(`article_${login}_rated`, id, JSON.stringify({ date: Date.now(), id }))
    return await db.getHashLen(`article_${id}_rating`)
  }

  async downrate(id, login) {
    if (!id || !login) return
    await db.removeFromHash(`article_${id}_rating`, login)
    await db.removeFromHash(`article_${login}_rated`, id)
    return await db.getHashLen(`article_${id}_rating`)
  }

  async getRating(id) {
    return await db.getHashLen(`article_${id}_rating`)
  }
  
  async getById(id, login, checkOwner = false, checkPrivacy = false, admin = false) {
    let article = await db.findInHash(`articles_${login}`, id)
    if (!article) return false
    article = JSON.parse(article)
    if (checkOwner && article.author !== login) return false
    if (checkPrivacy && !article.is_public && article.author !== login && !admin) return false
    // Add unsafe props
    return article
  }

  async create(title, content, type, author, is_public) {
    const count = await db.getHashLen('articles')
    const id = Number(count) + 1
    const data = {
      id,
      title,
      content,
      lastEdit: Date.now(),
      type,
      created: Date.now(),
      author,
      is_public
    }
    if (is_public) {
      await db.addToHash(`articles_${author}`, id, JSON.stringify(data))
    }
    await db.addToHash('articles', id, JSON.stringify(data))
    return await this.getById(id, author)
  }
  
  async edit(id, login, data) {
    let article = await this.getById(id, login, true)
    const oldEdit = JSON.stringify(article)
    if (!article) return false
    console.log('DATA AT EDIT', data)
    _.forEach(data, (value, key) => {
      console.log('Value', value, `includes key ${key}? ${this.ALLOWED_EDIT_PROPS.includes(key)}`)
      if (this.ALLOWED_EDIT_PROPS.includes(key)) article[key] = value
    })
    const newEdit = JSON.stringify(article)
    if (oldEdit === newEdit) {
      console.log(`article not edited, login: ${login}, id: ${id}`)
    }
    console.log('NEW ARTICLE WILL BE', newEdit)
    const result = await this.save(article)
    if (!result) return false
    return result
  }

  async save(article) {
    const now = Date.now()
    if (!article.id || !article.author) return false
    await db.addToHash(`articles_${article.author}`, article.id, JSON.stringify({ ...article, lastEdit: now }))
    if (article.is_public) {
      await db.addToHash(`articles`, article.id, JSON.stringify({ ...article, lastEdit: now }))
    } else {
      await db.removeFromHash(`articles`, article.id)
    }
    await db.addToHash(`articles_edits`, `id_${article.id}_${Date.now()}`, JSON.stringify({ date: now, article: { ...article, lastEdit: now } }))
    console.log('Returning article', article)
    return article
  }

  async remove(id, login) {
    let article = await db.findInHash('articles', id)
    if (!article) return false
    article = JSON.parse(article)
    if (article.author !== login) return false
    await db.removeFromHash('articles', id)
    await db.removeFromHash(`articles_${login}`, id)
    return true
  }
}

module.exports = new Article()

