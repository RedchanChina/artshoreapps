const { getOpenId, getUserByOpenId, ensureUser, collection } = require('../common/db')
const { success, fail, pageResult } = require('../common/response')
const COL = require('../common/constants')

async function login(event, context) {
  try {
    const openId = await getOpenId(context)
    const user = await ensureUser(openId)
    const token = openId
    return success({ token, userInfo: user })
  } catch (err) {
    return fail(err.message || '登录失败')
  }
}

async function getUserInfo(event, context) {
  try {
    const openId = await getOpenId(context)
    const user = await getUserByOpenId(openId)
    if (!user) {
      return fail('用户不存在')
    }
    return success(user)
  } catch (err) {
    return fail(err.message || '获取用户信息失败')
  }
}

async function updateUser(event, context) {
  try {
    const openId = await getOpenId(context)
    const { data } = event
    const allowedFields = ['nickname', 'avatar', 'phone', 'email', 'gender', 'bio']
    const updateData = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    updateData.updatedAt = new Date().toISOString()
    await collection(COL.users).where({ openId }).update(updateData)
    const user = await getUserByOpenId(openId)
    return success(user)
  } catch (err) {
    return fail(err.message || '更新用户信息失败')
  }
}

async function getAddresses(event, context) {
  try {
    const openId = await getOpenId(context)
    const { data } = await collection(COL.addresses)
      .where({ openId })
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')
      .get()
    return success(data)
  } catch (err) {
    return fail(err.message || '获取地址列表失败')
  }
}

async function addAddress(event, context) {
  try {
    const openId = await getOpenId(context)
    const { data } = event
    const now = new Date().toISOString()
    if (data.isDefault) {
      await collection(COL.addresses).where({ openId, isDefault: true }).update({ isDefault: false })
    }
    const result = await collection(COL.addresses).add({
      openId,
      name: data.name,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      detail: data.detail,
      isDefault: data.isDefault || false,
      createdAt: now,
      updatedAt: now,
    })
    const address = (await collection(COL.addresses).doc(result.id).get()).data
    return success(address)
  } catch (err) {
    return fail(err.message || '添加地址失败')
  }
}

async function updateAddress(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id, data } = event
    const addr = (await collection(COL.addresses).doc(id).get()).data
    if (!addr || addr.openId !== openId) {
      return fail('地址不存在或无权限')
    }
    if (data.isDefault) {
      await collection(COL.addresses).where({ openId, isDefault: true }).update({ isDefault: false })
    }
    const allowedFields = ['name', 'phone', 'province', 'city', 'district', 'detail', 'isDefault']
    const updateData = { updatedAt: new Date().toISOString() }
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    await collection(COL.addresses).doc(id).update(updateData)
    const address = (await collection(COL.addresses).doc(id).get()).data
    return success(address)
  } catch (err) {
    return fail(err.message || '更新地址失败')
  }
}

async function deleteAddress(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const addr = (await collection(COL.addresses).doc(id).get()).data
    if (!addr || addr.openId !== openId) {
      return fail('地址不存在或无权限')
    }
    await collection(COL.addresses).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '删除地址失败')
  }
}

async function getCollections(event, context) {
  try {
    const openId = await getOpenId(context)
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.collections).where({ openId })
    if (params.targetType) {
      query = query.where({ targetType: params.targetType })
    }
    const { total } = await query.count()
    const { data } = await query.skip(skip).limit(pageSize).orderBy('collectedAt', 'desc').get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取收藏列表失败')
  }
}

async function addCollection(event, context) {
  try {
    const openId = await getOpenId(context)
    const { data } = event
    const existing = await collection(COL.collections)
      .where({ openId, targetType: data.targetType, targetId: data.targetId })
      .get()
    if (existing.data.length > 0) {
      return fail('已收藏', 10001)
    }
    const now = new Date().toISOString()
    const result = await collection(COL.collections).add({
      openId,
      targetType: data.targetType,
      targetId: data.targetId,
      collectedAt: now,
    })
    const item = (await collection(COL.collections).doc(result.id).get()).data
    return success(item)
  } catch (err) {
    return fail(err.message || '收藏失败')
  }
}

async function removeCollection(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const item = (await collection(COL.collections).doc(id).get()).data
    if (!item || item.openId !== openId) {
      return fail('收藏不存在或无权限')
    }
    await collection(COL.collections).doc(id).remove()
    return success(null)
  } catch (err) {
    return fail(err.message || '取消收藏失败')
  }
}

async function getCoupons(event, context) {
  try {
    const openId = await getOpenId(context)
    const now = new Date().toISOString()
    const { data } = await collection(COL.coupons)
      .where({ openId })
      .orderBy('endDate', 'asc')
      .get()
    const coupons = data.map((c) => {
      let status = c.status
      if (status === 'available' && c.endDate < now) {
        status = 'expired'
      }
      return { ...c, status }
    })
    return success(coupons)
  } catch (err) {
    return fail(err.message || '获取优惠券失败')
  }
}

const handlers = {
  login,
  'info': getUserInfo,
  update: updateUser,
  addresses: getAddresses,
  'address-add': addAddress,
  'address-update': updateAddress,
  'address-delete': deleteAddress,
  collections: getCollections,
  'collection-add': addCollection,
  'collection-remove': removeCollection,
  coupons: getCoupons,
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
