import { callAction, type PageResult } from './cloudbase'

export interface Article {
  id: string
  title: string
  coverImage: string
  author: string
  summary: string
  content: string
  viewCount: number
  likeCount: number
  createdAt: string
}

export interface Topic {
  id: string
  name: string
  coverImage: string
  description: string
  postCount: number
  followCount: number
  isFollowed: boolean
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  userNickname: string
  userAvatar: string
  topicId: string
  topicName: string
  content: string
  images: string[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  createdAt: string
}

export interface ArticleListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface TopicListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface PostListParams {
  page?: number
  pageSize?: number
  topicId?: string
  userId?: string
}

export async function getArticles(
  params: ArticleListParams = {},
): Promise<PageResult<Article>> {
  return callAction<PageResult<Article>>('community', 'articles', { params })
}

export async function getArticleDetail(id: string): Promise<Article> {
  return callAction<Article>('community', 'article-detail', { id })
}

export async function getTopics(
  params: TopicListParams = {},
): Promise<PageResult<Topic>> {
  return callAction<PageResult<Topic>>('community', 'topics', { params })
}

export async function getTopicDetail(id: string): Promise<Topic> {
  return callAction<Topic>('community', 'topic-detail', { id })
}

export async function getPosts(
  params: PostListParams = {},
): Promise<PageResult<Post>> {
  return callAction<PageResult<Post>>('community', 'posts', { params })
}

export async function createPost(
  data: Pick<Post, 'topicId' | 'content' | 'images'>,
): Promise<Post> {
  return callAction<Post>('community', 'post-create', { data })
}

export async function likePost(id: string): Promise<void> {
  return callAction<void>('community', 'post-like', { id })
}

export async function commentPost(
  id: string,
  content: string,
): Promise<void> {
  return callAction<void>('community', 'post-comment', { id, content })
}
