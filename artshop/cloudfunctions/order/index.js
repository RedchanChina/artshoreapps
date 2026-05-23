const { collection, getOpenId, getUserByOpenId } = require('./common/db')
const { success, fail, pageResult } = require('./common/response')
const COL = require('./common/constants')

async function createOrder(event, context) {
  try {
    const openId = await getOpenId(context)
    const { orderData } = event
    const user = await getUserByOpenId(openId)
    if (!user) {
      return fail('用户不存在')
    }
    const address = (await collection(COL.addresses).doc(orderData.addressId).get()).data
    if (!address) {
      return fail('收货地址不存在')
    }
    const items = []
    let totalPrice = 0
    for (const item of orderData.items) {
      const artwork = (await collection(COL.artworks).doc(item.artworkId).get()).data
      if (!artwork) {
        return fail(`作品 ${item.artworkId} 不存在`)
      }
      const spec = artwork.specifications.find(
        (s) => s.size === item.spec.size && s.material === item.spec.material && s.frameStyle === item.spec.frameStyle,
      )
      const unitPrice = spec ? spec.price : artwork.price
      const subtotal = unitPrice * item.quantity
      totalPrice += subtotal
      items.push({
        artworkId: item.artworkId,
        artworkTitle: artwork.title,
        artworkImage: artwork.image,
        artistName: artwork.artistName,
        spec: item.spec,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      })
    }
    let discountAmount = 0
    if (orderData.couponId) {
      const coupon = (await collection(COL.coupons).doc(orderData.couponId).get()).data
      if (coupon && coupon.status === 'available' && coupon.minAmount <= totalPrice) {
        discountAmount = coupon.discount
        await collection(COL.coupons).doc(orderData.couponId).update({ status: 'used' })
      }
    }
    const shippingFee = totalPrice >= 299 ? 0 : 15
    const actualPrice = totalPrice + shippingFee - discountAmount
    const now = new Date().toISOString()
    const result = await collection(COL.orders).add({
      userId: openId,
      items,
      totalPrice,
      shippingFee,
      discountAmount,
      actualPrice: Math.max(actualPrice, 0),
      status: 'PENDING_PAYMENT',
      shippingInfo: '',
      paymentMethod: '',
      paymentTime: '',
      remark: orderData.remark || '',
      addressSnapshot: address,
      createdAt: now,
      updatedAt: now,
    })
    const order = (await collection(COL.orders).doc(result.id).get()).data
    return success(order)
  } catch (err) {
    return fail(err.message || '创建订单失败')
  }
}

async function getOrderList(event, context) {
  try {
    const openId = await getOpenId(context)
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.orders).where({ userId: openId })
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

async function getOrderDetail(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const { data } = await collection(COL.orders).doc(id).get()
    if (!data || data.userId !== openId) {
      return fail('订单不存在或无权限')
    }
    return success(data)
  } catch (err) {
    return fail(err.message || '获取订单详情失败')
  }
}

async function cancelOrder(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const { data } = await collection(COL.orders).doc(id).get()
    if (!data || data.userId !== openId) {
      return fail('订单不存在或无权限')
    }
    if (data.status !== 'PENDING_PAYMENT') {
      return fail('当前状态不可取消')
    }
    await collection(COL.orders).doc(id).update({
      status: 'AFTER_SALE',
      updatedAt: new Date().toISOString(),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '取消订单失败')
  }
}

async function confirmReceive(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const { data } = await collection(COL.orders).doc(id).get()
    if (!data || data.userId !== openId) {
      return fail('订单不存在或无权限')
    }
    if (data.status !== 'SHIPPED') {
      return fail('当前状态不可确认收货')
    }
    await collection(COL.orders).doc(id).update({
      status: 'COMPLETED',
      updatedAt: new Date().toISOString(),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '确认收货失败')
  }
}

async function requestRefund(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id, reason } = event
    const { data } = await collection(COL.orders).doc(id).get()
    if (!data || data.userId !== openId) {
      return fail('订单不存在或无权限')
    }
    if (!['PENDING_SHIPMENT', 'SHIPPED'].includes(data.status)) {
      return fail('当前状态不可申请退款')
    }
    await collection(COL.orders).doc(id).update({
      status: 'AFTER_SALE',
      refundReason: reason,
      updatedAt: new Date().toISOString(),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '申请退款失败')
  }
}

const handlers = {
  create: createOrder,
  list: getOrderList,
  detail: getOrderDetail,
  cancel: cancelOrder,
  'confirm-receive': confirmReceive,
  'request-refund': requestRefund,
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
