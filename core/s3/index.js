const OSAPI_S3 = require('osapi/s3')
const shortID = require('shortid')
const fs = require('fs')
const path = require('path')
const config = require('../config')
const imgDir = path.resolve(__dirname, '../../img')
const sharp = require('sharp')
const AWS = require('aws-sdk')
const _ = require('lodash')

console.log(`URL ENDPOINT`, config.S3.URL)

let s3 = new OSAPI_S3.Connection({
  endPoint: config.S3.URL,
  accessKey: config.S3.KEY,
  secretAccessKey: config.S3.SECRET,
  bucket: config.S3.BUCKET,
})

let aws = new AWS.S3({
  endpoint: config.S3.URL,
  accessKeyId: config.S3.KEY,
  secretAccessKey: config.S3.SECRET,
  s3ForcePathStyle: true,
})
const params = {
  Bucket: config.S3.BUCKET,
  Prefix: '',
}

function listFiles(Prefix) {
  return new Promise((resolve, reject) => {
    aws.listObjects({ ...params, Prefix }, function(err, files) {
      if (err) {
        console.log(`Error at list files`, err)
      }
      resolve(files)
    })
  })
}

async function removeFilesByPrefix(prefix) {
  const files = await listFiles(prefix)
  return await Promise.all(_.map(files.Contents, file => remove(file.Key)))
}

async function makePreview(imageData, size) {
  return await sharp(imageData).resize(size || 200).withMetadata().toBuffer()
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
      console.log(`Removed ${nameObject}`)
      resolve(nameObject)
    })
  })
}

//

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

module.exports = {
  upload,
  uploadFiles,
  listFiles,
  makePreview,
  remove,
  removeFilesByPrefix,
}