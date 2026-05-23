const { collection, getOpenId } = require('../common/db')
const { success, fail, pageResult } = require('../common/response')
const COL = require('../common/constants')

async function getArtistList(event) {
  try {
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.artists)
    if (params.keyword) {
      query = query.where({
        name: query.command.regex(`.*${params.keyword}.*`),
      })
    }
    const { total } = await query.count()
    const orderField = params.sortBy || 'createdAt'
    const orderDirection = params.sortOrder || 'desc'
    const { data } = await query.skip(skip).limit(pageSize).orderBy(orderField, orderDirection).get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取艺术家列表失败')
  }
}

async function getArtistDetail(event) {
  try {
    const { id } = event
    const { data } = await collection(COL.artists).doc(id).get()
    if (!data) {
      return fail('艺术家不存在')
    }
    return success(data)
  } catch (err) {
    return fail(err.message || '获取艺术家详情失败')
  }
}

async function followArtist(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const existing = await collection(COL.follows)
      .where({ openId, artistId: id })
      .get()
    if (existing.data.length > 0) {
      return fail('已关注', 10001)
    }
    await collection(COL.follows).add({
      openId,
      artistId: id,
      createdAt: new Date().toISOString(),
    })
    await collection(COL.artists).doc(id).update({
      followerCount: collection(COL.artists).command.inc(1),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '关注失败')
  }
}

async function unfollowArtist(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const existing = await collection(COL.follows)
      .where({ openId, artistId: id })
      .get()
    if (existing.data.length === 0) {
      return fail('未关注', 10002)
    }
    await collection(COL.follows).doc(existing.data[0]._id).remove()
    await collection(COL.artists).doc(id).update({
      followerCount: collection(COL.artists).command.inc(-1),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '取消关注失败')
  }
}

async function getArtistArtworks(event) {
  try {
    const { artistId } = event
    const { data } = await collection(COL.artworks)
      .where({ artistId })
      .orderBy('createdAt', 'desc')
      .get()
    return success(data)
  } catch (err) {
    return fail(err.message || '获取艺术家作品失败')
  }
}

const handlers = {
  list: getArtistList,
  detail: getArtistDetail,
  follow: followArtist,
  unfollow: unfollowArtist,
  artworks: getArtistArtworks,
}

exports.main = async (event, context) => {
  const { action } = event
  if (!action) {
    return fail('缺少 action 参数')
  }
  const handler = handlers[action]
  if (!handler) {
    return fail(`未知操作: ${action}`)
  }
  return handler(event, context)
}
