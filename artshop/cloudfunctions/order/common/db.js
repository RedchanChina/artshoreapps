const cloudbase = require('@cloudbase/node-sdk')

let app = null
let dbInstance = null

function getApp() {
  if (!app) {
    app = cloudbase.init()
  }
  return app
}

function getDb() {
  if (!dbInstance) {
    dbInstance = getApp().database()
  }
  return dbInstance
}

function collection(name) {
  return getDb().collection(name)
}

async function getOpenId(context) {
  const openId = context.OPENID || ''
  if (!openId) {
    throw new Error('未获取到用户身份')
  }
  return openId
}

async function getUserByOpenId(openId) {
  const { data } = await collection('users').where({ openId }).get()
  return data.length > 0 ? data[0] : null
}

async function ensureUser(openId) {
  let user = await getUserByOpenId(openId)
  if (!user) {
    const now = new Date().toISOString()
    const result = await collection('users').add({
      openId,
      nickname: '艺术爱好者',
      avatar: '',
      phone: '',
      email: '',
      gender: '',
      bio: '',
      memberLevel: 0,
      createdAt: now,
      updatedAt: now,
    })
    user = (await collection('users').doc(result.id).get()).data
  }
  return user
}

function paginate(collectionRef, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize
  return {
    skip,
    limit: pageSize,
  }
}

module.exports = {
  getApp,
  getDb,
  collection,
  getOpenId,
  getUserByOpenId,
  ensureUser,
  paginate,
}
