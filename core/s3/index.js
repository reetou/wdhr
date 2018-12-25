const OSAPI_S3 = require('osapi/s3')
const shortID = require('shortid')
const fs = require('fs')
const path = require('path')
const config = require('../config')
const imgDir = path.resolve(__dirname, '../../img')
const sharp = require('sharp')

console.log(`URL ENDPOINT`, config.S3.URL)

let s3 = new OSAPI_S3.Connection({
  endPoint: config.S3.URL,
  accessKey: config.S3.KEY,
  secretAccessKey: config.S3.SECRET,
  bucket: config.S3.BUCKET,
})

async function makePreview(imageData, size) {
  return await sharp(imageData).resize(size || 200).withMetadata().toBuffer()
}

async function uploadFile(buff, name, mime) {
  try {
    const thumbBuffer = await makePreview(buff)
    const name = `${Date.now()}_feed_image.jpg`
    const buffer = buff
    console.log(`Buffer for image ${name}`, buffer)
    console.log(`Buffer for thumb image thumb_${name}`, thumbBuffer)
    await s3.createObject({
      name,
      contentType: 'image/jpeg'
    }, buffer)
    await s3.createObject({
      name: `thumb_${name}`,
      contentType: 'image/jpeg'
    }, thumbBuffer)
    return {
      thumb: `https://ftp.rocket-cdn.ru/hyperloop/thumb_${name}`,
      raw: `https://ftp.rocket-cdn.ru/hyperloop/${name}`
    }
  } catch (e) {
    console.log('[error] Error at uploading', e)
    return false
  }
}

function upload(nameObject, file) {
  return new Promise((resolve, reject) => {
    s3.createObject(nameObject, file, (err, data) => {
      if (err) {
        console.log(`Error at upload??`, err)
        reject(err)
      }
      resolve()
    })
  })
}

function remove(nameObject) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(nameObject, (err, data) => {
      if (err) {
        console.log(`Error at remove file ${nameObject}??`, err)
        reject(err)
      }
      resolve()
    })
  })
}

async function uploadFiles(files, dirName) {
  const s3_bucket_url = `${config.S3.URL}/${config.S3.BUCKET}`
  const links = await Promise.all(files.map(async file => {
    const name = `${dirName}/${file.originalname}`
    await upload({
      name,
      contentType: file.mimetype,
      acl: 'public-read'
    }, file.buffer)
    return {
      index: false,
      originalname: file.originalname,
      name,
      url: `${s3_bucket_url}/${name}`,
      mimetype: file.mimetype
    }
  }))
  links.forEach(f => {
    const isIndexName = f.name.includes('.html') && f.name.includes('index')
    if (isIndexName) f.index = true
  })
  return links
}

async function uploadBase64Image(str) {
  try {
    let extension = str.substring("data:image/".length, str.indexOf(";base64"))
    const splitted = str.split(',')
    let b64String = splitted[1]
    if (!b64String) {
      b64String = splitted[0]
      extension = 'jpeg'
    }
    if (!b64String) return false
    const buffer = await Buffer.from(b64String, 'base64')
    const thumbBuffer = await makePreview(buffer)
    const name = `${Date.now()}_chat_image.${extension}`
    const thumbName = `thumb_${Date.now()}_chat_image.${extension}`
    await s3.createObject({
      name,
      contentType: `image/${extension}`
    }, buffer)
    await s3.createObject({
      name: thumbName,
      contentType: `image/jpeg`
    }, thumbBuffer)
    return {
      thumb: `https://ftp.rocket-cdn.ru/hyperloop/${thumbName}`,
      raw: `https://ftp.rocket-cdn.ru/hyperloop/${name}`
    }
  } catch (e) {
    console.log('[Error] error at uploading base64 image', e)
    return false
  }
}

module.exports = {
  upload,
  uploadFiles,
  makePreview,
  remove,
  uploadBase64Image,
}