const { collection, getOpenId } = require('./common/db')
const { success, fail, pageResult } = require('./common/response')
const COL = require('./common/constants')

async function getArticles(event) {
  try {
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.articles)
    if (params.keyword) {
      query = query.where({
        title: query.command.regex(`.*${params.keyword}.*`),
      })
    }
    const { total } = await query.count()
    const { data } = await query.skip(skip).limit(pageSize).orderBy('createdAt', 'desc').get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取文章列表失败')
  }
}

async function getArticleDetail(event) {
  try {
    const { id } = event
    const { data } = await collection(COL.articles).doc(id).get()
    if (!data) {
      return fail('文章不存在')
    }
    await collection(COL.articles).doc(id).update({
      viewCount: collection(COL.articles).command.inc(1),
    })
    return success(data)
  } catch (err) {
    return fail(err.message || '获取文章详情失败')
  }
}

async function getTopics(event) {
  try {
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.topics)
    if (params.keyword) {
      query = query.where({
        name: query.command.regex(`.*${params.keyword}.*`),
      })
    }
    const { total } = await query.count()
    const { data } = await query.skip(skip).limit(pageSize).orderBy('postCount', 'desc').get()
    return pageResult(data, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取话题列表失败')
  }
}

async function getTopicDetail(event) {
  try {
    const { id } = event
    const { data } = await collection(COL.topics).doc(id).get()
    if (!data) {
      return fail('话题不存在')
    }
    return success(data)
  } catch (err) {
    return fail(err.message || '获取话题详情失败')
  }
}

async function getPosts(event, context) {
  try {
    const openId = context.OPENID || ''
    const { params = {} } = event
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const skip = (page - 1) * pageSize
    let query = collection(COL.posts)
    if (params.topicId) {
      query = query.where({ topicId: params.topicId })
    }
    if (params.userId) {
      query = query.where({ userId: params.userId })
    }
    const { total } = await query.count()
    const { data } = await query.skip(skip).limit(pageSize).orderBy('createdAt', 'desc').get()
    const posts = await Promise.all(
      data.map(async (post) => {
        const likeRecord = openId
          ? await collection('post_likes').where({ postId: post._id, openId }).get()
          : { data: [] }
        return {
          ...post,
          id: post._id,
          isLiked: likeRecord.data.length > 0,
        }
      }),
    )
    return pageResult(posts, total, page, pageSize)
  } catch (err) {
    return fail(err.message || '获取帖子列表失败')
  }
}

async function createPost(event, context) {
  try {
    const openId = await getOpenId(context)
    const { data } = event
    const user = await collection(COL.users).where({ openId }).get()
    if (user.data.length === 0) {
      return fail('用户不存在')
    }
    const userInfo = user.data[0]
    const now = new Date().toISOString()
    const result = await collection(COL.posts).add({
      userId: openId,
      userNickname: userInfo.nickname,
      userAvatar: userInfo.avatar,
      topicId: data.topicId,
      topicName: '',
      content: data.content,
      images: data.images || [],
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
    })
    if (data.topicId) {
      const topic = (await collection(COL.topics).doc(data.topicId).get()).data
      if (topic) {
        await collection(COL.posts).doc(result.id).update({ topicName: topic.name })
        await collection(COL.topics).doc(data.topicId).update({
          postCount: collection(COL.topics).command.inc(1),
        })
      }
    }
    const post = (await collection(COL.posts).doc(result.id).get()).data
    return success({ ...post, id: post._id })
  } catch (err) {
    return fail(err.message || '创建帖子失败')
  }
}

async function likePost(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id } = event
    const existing = await collection('post_likes').where({ postId: id, openId }).get()
    if (existing.data.length > 0) {
      return fail('已点赞', 10001)
    }
    await collection('post_likes').add({ postId: id, openId, createdAt: new Date().toISOString() })
    await collection(COL.posts).doc(id).update({
      likeCount: collection(COL.posts).command.inc(1),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '点赞失败')
  }
}

async function commentPost(event, context) {
  try {
    const openId = await getOpenId(context)
    const { id, content } = event
    const user = await collection(COL.users).where({ openId }).get()
    if (user.data.length === 0) {
      return fail('用户不存在')
    }
    const userInfo = user.data[0]
    await collection(COL.comments).add({
      postId: id,
      userId: openId,
      userNickname: userInfo.nickname,
      userAvatar: userInfo.avatar,
      content,
      createdAt: new Date().toISOString(),
    })
    await collection(COL.posts).doc(id).update({
      commentCount: collection(COL.posts).command.inc(1),
    })
    return success(null)
  } catch (err) {
    return fail(err.message || '评论失败')
  }
}

const handlers = {
  articles: getArticles,
  'article-detail': getArticleDetail,
  topics: getTopics,
  'topic-detail': getTopicDetail,
  posts: getPosts,
  'post-create': createPost,
  'post-like': likePost,
  'post-comment': commentPost,
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
