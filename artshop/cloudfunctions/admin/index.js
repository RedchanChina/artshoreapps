const { collection } = require('./common/db')
const { success, fail, pageResult } = require('./common/response')
const COL = require('./common/constants')

async function addArtwork(event) {
  try {
    const { data } = event
    const now = new Date().toISOString()
    const result = await collection(COL.artworks).add({
      title: data.title,
      image: data.image || '',
      images: data.images || [],
      artistName: data.artistName || '',
      artistId: data.artistId || '',
      category: data.category || 'photography',
      price: data.price || 0,
      originalPrice: data.originalPrice || null,
      description: data.description || '',
      specifications: data.specifications || [],
      sales: 0,
      stock: data.stock || 0,
      rating: data.rating || 5.0,
      tags: data.tags || [],
      createdAt: now,
    })
    return success({ id: result.id })
  } catch (err) {
    return fail(err.message || '添加作品失败')
  }
}

async function updateArtwork(event) {
  try {
    const { id, data } = event
    const allowedFields = ['title', 'image', 'images', 'artistName', 'artistId', 'category', 'price', 'originalPrice', 'description', 'specifications', 'stock', 'rating', 'tags']
    const updateData = { updatedAt: new Date().toISOString() }
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    await collection(COL.artworks).doc(id).update(updateData)
    return success(null)
  } catch (err) {
    return fail(err.message || '更新作品失败')
  }
}

async function deleteArtwork(event) {
  try {
    const { id } = event
    await collection(COL.artworks).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '删除作品失败')
  }
}

async function addArtist(event) {
  try {
    const { data } = event
    const now = new Date().toISOString()
    const result = await collection(COL.artists).add({
      name: data.name,
      avatar: data.avatar || '',
      bio: data.bio || '',
      representativeWorks: data.representativeWorks || [],
      followerCount: 0,
      isFollowing: false,
      story: data.story || '',
      exhibitions: data.exhibitions || [],
      honors: data.honors || [],
      createdAt: now,
    })
    return success({ id: result.id })
  } catch (err) {
    return fail(err.message || '添加艺术家失败')
  }
}

async function updateArtist(event) {
  try {
    const { id, data } = event
    const allowedFields = ['name', 'avatar', 'bio', 'representativeWorks', 'story', 'exhibitions', 'honors']
    const updateData = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    await collection(COL.artists).doc(id).update(updateData)
    return success(null)
  } catch (err) {
    return fail(err.message || '更新艺术家失败')
  }
}

async function deleteArtist(event) {
  try {
    const { id } = event
    await collection(COL.artists).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '删除艺术家失败')
  }
}

async function getOrderList(event) {
  try {
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const skip = (page - 1) * pageSize
    let query = collection(COL.orders)
    if (params.status) {
      query = query.where({ status: params.status })
    }
    const { total } = await query.count()
    const { data } = await query.skip(skip).limit(pageSize).orderBy('createdAt', 'desc').get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取订单列表失败')
  }
}

async function updateOrderStatus(event) {
  try {
    const { id, status } = event
    await collection(COL.orders).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '更新订单状态失败')
  }
}

async function addExhibition(event) {
  try {
    const { data } = event
    const result = await collection(COL.exhibitions).add({
      title: data.title,
      coverImage: data.coverImage || '',
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location || '',
      description: data.description || '',
      ticketPrice: data.ticketPrice || 0,
      isRegistered: false,
    })
    return success({ id: result.id })
  } catch (err) {
    return fail(err.message || '添加展览失败')
  }
}

async function updateExhibition(event) {
  try {
    const { id, data } = event
    const allowedFields = ['title', 'coverImage', 'startDate', 'endDate', 'location', 'description', 'ticketPrice']
    const updateData = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    await collection(COL.exhibitions).doc(id).update(updateData)
    return success(null)
  } catch (err) {
    return fail(err.message || '更新展览失败')
  }
}

async function deleteExhibition(event) {
  try {
    const { id } = event
    await collection(COL.exhibitions).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '删除展览失败')
  }
}

async function addArticle(event) {
  try {
    const { data } = event
    const now = new Date().toISOString()
    const result = await collection(COL.articles).add({
      title: data.title,
      coverImage: data.coverImage || '',
      author: data.author || 'ArtShop 编辑部',
      summary: data.summary || '',
      content: data.content || '',
      viewCount: 0,
      likeCount: 0,
      createdAt: now,
    })
    return success({ id: result.id })
  } catch (err) {
    return fail(err.message || '添加文章失败')
  }
}

async function updateArticle(event) {
  try {
    const { id, data } = event
    const allowedFields = ['title', 'coverImage', 'author', 'summary', 'content']
    const updateData = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    await collection(COL.articles).doc(id).update(updateData)
    return success(null)
  } catch (err) {
    return fail(err.message || '更新文章失败')
  }
}

async function deleteArticle(event) {
  try {
    const { id } = event
    await collection(COL.articles).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '删除文章失败')
  }
}

async function addStore(event) {
  try {
    const { data } = event
    const result = await collection(COL.stores).add({
      name: data.name,
      address: data.address || '',
      businessHours: data.businessHours || '',
      images: data.images || [],
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
    })
    return success({ id: result.id })
  } catch (err) {
    return fail(err.message || '添加门店失败')
  }
}

async function updateStore(event) {
  try {
    const { id, data } = event
    const allowedFields = ['name', 'address', 'businessHours', 'images', 'latitude', 'longitude', 'phone']
    const updateData = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    await collection(COL.stores).doc(id).update(updateData)
    return success(null)
  } catch (err) {
    return fail(err.message || '更新门店失败')
  }
}

async function deleteStore(event) {
  try {
    const { id } = event
    await collection(COL.stores).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '删除门店失败')
  }
}

async function getDashboardStats() {
  try {
    const [artworks, artists, orders, users] = await Promise.all([
      collection(COL.artworks).count(),
      collection(COL.artists).count(),
      collection(COL.orders).count(),
      collection(COL.users).count(),
    ])
    return success({
      artworkCount: artworks.total,
      artistCount: artists.total,
      orderCount: orders.total,
      userCount: users.total,
    })
  } catch (err) {
    return fail(err.message || '获取统计数据失败')
  }
}

const handlers = {
  'artwork-add': addArtwork,
  'artwork-update': updateArtwork,
  'artwork-delete': deleteArtwork,
  'artist-add': addArtist,
  'artist-update': updateArtist,
  'artist-delete': deleteArtist,
  'order-list': getOrderList,
  'order-update-status': updateOrderStatus,
  'exhibition-add': addExhibition,
  'exhibition-update': updateExhibition,
  'exhibition-delete': deleteExhibition,
  'article-add': addArticle,
  'article-update': updateArticle,
  'article-delete': deleteArticle,
  'store-add': addStore,
  'store-update': updateStore,
  'store-delete': deleteStore,
  'dashboard-stats': getDashboardStats,
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
