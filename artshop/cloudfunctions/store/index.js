const { collection, getOpenId } = require('../common/db')
const { success, fail, pageResult } = require('../common/response')
const COL = require('../common/constants')

async function getStoreLocations(event) {
  try {
    const { data } = await collection(COL.stores).orderBy('createdAt', 'asc').get()
    return success(data)
  } catch (err) {
    return fail(err.message || '获取门店列表失败')
  }
}

async function getExhibitions(event) {
  try {
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.exhibitions)
    if (params.status) {
      const now = new Date().toISOString()
      if (params.status === 'ongoing') {
        query = query.where({
          startDate: query.command.lte(now),
          endDate: query.command.gte(now),
        })
      } else if (params.status === 'upcoming') {
        query = query.where({ startDate: query.command.gt(now) })
      } else if (params.status === 'ended') {
        query = query.where({ endDate: query.command.lt(now) })
      }
    }
    const { total } = await query.count()
    const { data } = await query.skip(skip).limit(pageSize).orderBy('startDate', 'desc').get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取展览列表失败')
  }
}

async function getExhibitionDetail(event) {
  try {
    const { id } = event
    const { data } = await collection(COL.exhibitions).doc(id).get()
    if (!data) {
      return fail('展览不存在')
    }
    return success(data)
  } catch (err) {
    return fail(err.message || '获取展览详情失败')
  }
}

async function registerExhibition(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const exhibition = (await collection(COL.exhibitions).doc(id).get()).data
    if (!exhibition) {
      return fail('展览不存在')
    }
    const existing = await collection(COL.registrations)
      .where({ exhibitionId: id, openId })
      .get()
    if (existing.data.length > 0) {
      return fail('已报名', 10001)
    }
    await collection(COL.registrations).add({
      exhibitionId: id,
      openId,
      type: 'register',
      createdAt: new Date().toISOString(),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '报名失败')
  }
}

async function checkInExhibition(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const existing = await collection(COL.registrations)
      .where({ exhibitionId: id, openId, type: 'register' })
      .get()
    if (existing.data.length === 0) {
      return fail('未报名，无法签到')
    }
    const checkIn = await collection(COL.registrations)
      .where({ exhibitionId: id, openId, type: 'checkin' })
      .get()
    if (checkIn.data.length > 0) {
      return fail('已签到', 10002)
    }
    await collection(COL.registrations).add({
      exhibitionId: id,
      openId,
      type: 'checkin',
      createdAt: new Date().toISOString(),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '签到失败')
  }
}

const handlers = {
  locations: getStoreLocations,
  exhibitions: getExhibitions,
  'exhibition-detail': getExhibitionDetail,
  'exhibition-register': registerExhibition,
  'exhibition-checkin': checkInExhibition,
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
