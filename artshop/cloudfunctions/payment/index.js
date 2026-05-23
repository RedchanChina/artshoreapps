const { collection, getOpenId } = require('../common/db')
const { success, fail } = require('../common/response')
const COL = require('../common/constants')

async function createPayment(event, context) {
  try {
    const openId = await getOpenId(context)
    const { orderId, method } = event
    const order = (await collection(COL.orders).doc(orderId).get()).data
    if (!order || order.userId !== openId) {
      return fail('订单不存在或无权限')
    }
    if (order.status !== 'PENDING_PAYMENT') {
      return fail('订单状态不可支付')
    }
    const now = new Date().toISOString()
    const paymentResult = await collection(COL.payments).add({
      orderId,
      userId: openId,
      amount: order.actualPrice,
      method,
      status: 'pending',
      createdAt: now,
    })
    await collection(COL.orders).doc(orderId).update({
      status: 'PENDING_SHIPMENT',
      paymentMethod: method,
      paymentTime: now,
      updatedAt: now,
    })
    const payment = (await collection(COL.payments).doc(paymentResult.id).get()).data
    return success({
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    })
  } catch (err) {
    return fail(err.message || '创建支付失败')
  }
}

async function verifyPayment(event, context) {
  try {
    const openId = await getOpenId(context)
    const { paymentId } = event
    const { data } = await collection(COL.payments).doc(paymentId).get()
    if (!data || data.userId !== openId) {
      return fail('支付记录不存在或无权限')
    }
    await collection(COL.payments).doc(paymentId).update({ status: 'paid' })
    const payment = (await collection(COL.payments).doc(paymentId).get()).data
    return success({
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: 'paid',
      createdAt: payment.createdAt,
    })
  } catch (err) {
    return fail(err.message || '验证支付失败')
  }
}

async function getPaymentStatus(event, context) {
  try {
    const openId = await getOpenId(context)
    const { orderId } = event
    const { data } = await collection(COL.payments)
      .where({ orderId, userId: openId })
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()
    if (data.length === 0) {
      return fail('支付记录不存在')
    }
    const payment = data[0]
    return success({
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    })
  } catch (err) {
    return fail(err.message || '获取支付状态失败')
  }
}

const handlers = {
  create: createPayment,
  verify: verifyPayment,
  status: getPaymentStatus,
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
