function success(data = null, message = 'ok') {
  return {
    code: 0,
    data,
    message,
  }
}

function fail(message = '请求失败', code = -1) {
  return {
    code,
    data: null,
    message,
  }
}

function pageResult(list, total, page, pageSize) {
  return {
    code: 0,
    data: {
      list,
      total,
      page,
      pageSize,
    },
    message: 'ok',
  }
}

module.exports = { success, fail, pageResult }
