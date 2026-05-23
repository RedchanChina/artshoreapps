const { collection, paginate } = require('./common/db')
const { success, fail, pageResult } = require('./common/response')
const COL = require('./common/constants')

async function getArtworkList(event) {
  try {
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.artworks)
    const filter = params.filter || {}
    if (filter.category) {
      query = query.where({ category: filter.category })
    }
    if (filter.priceRange && filter.priceRange[0] !== null) {
      query = query.where({
        price: query.command.gte(filter.priceRange[0]).and(query.command.lte(filter.priceRange[1])),
      })
    }
    if (filter.keyword) {
      query = query.where({
        title: query.command.regex(`.*${filter.keyword}.*`),
      })
    }
    const { total } = await query.count()
    let orderField = 'createdAt'
    let orderDirection = 'desc'
    if (filter.sortBy === 'price_asc') {
      orderField = 'price'
      orderDirection = 'asc'
    } else if (filter.sortBy === 'price_desc') {
      orderField = 'price'
      orderDirection = 'desc'
    } else if (filter.sortBy === 'sales') {
      orderField = 'sales'
      orderDirection = 'desc'
    } else if (filter.sortBy === 'newest') {
      orderField = 'createdAt'
      orderDirection = 'desc'
    }
    const { data } = await query.skip(skip).limit(pageSize).orderBy(orderField, orderDirection).get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取作品列表失败')
  }
}

async function getArtworkDetail(event) {
  try {
    const { id } = event
    const { data } = await collection(COL.artworks).doc(id).get()
    if (!data) {
      return fail('作品不存在')
    }
    return success(data)
  } catch (err) {
    return fail(err.message || '获取作品详情失败')
  }
}

async function searchArtworks(event) {
  try {
    const { keyword } = event
    if (!keyword) {
      return success([])
    }
    const db = collection(COL.artworks)
    const { data } = await db
      .where({
        title: db.command.regex(`.*${keyword}.*`),
      })
      .limit(20)
      .get()
    return success(data)
  } catch (err) {
    return fail(err.message || '搜索作品失败')
  }
}

async function getArtworksByArtist(event) {
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

async function getLimitedEditions(event) {
  try {
    const { data } = await collection(COL.artworks)
      .where({ tags: db.command.elemMatch(db.command.eq('限量')) })
      .limit(20)
      .orderBy('createdAt', 'desc')
      .get()
    return success(data)
  } catch (err) {
    return fail(err.message || '获取限量作品失败')
  }
}

async function getNewArrivals(event) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await collection(COL.artworks)
      .where({
        createdAt: collection(COL.artworks).command.gte(thirtyDaysAgo),
      })
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
    return success(data)
  } catch (err) {
    return fail(err.message || '获取最新作品失败')
  }
}

const handlers = {
  list: getArtworkList,
  detail: getArtworkDetail,
  search: searchArtworks,
  'by-artist': getArtworksByArtist,
  'limited-editions': getLimitedEditions,
  'new-arrivals': getNewArrivals,
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
