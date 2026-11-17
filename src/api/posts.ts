import axios from 'axios'
import { api } from './auth'

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type CreatePostPayload = {
  title: string
  content: string
  image_urls: string[]
  excerpt?: string
  category_id?: number
  visibility: 'public' | 'followers' | 'private'
  is_draft: boolean
}

export type WritingTask = 'polish_content' | 'suggest_title' | 'suggest_excerpt'

export type WritingSuggestion = {
  task: WritingTask
  suggestion: string
}

export async function generateWritingSuggestion(payload: {
  task: WritingTask
  title: string
  content: string
}): Promise<WritingSuggestion> {
  const response = await api.post<WritingSuggestion>('/ai/writing-assistant', payload)
  return response.data
}

export type Post = {
  id: number
  title: string
  content: string
  image_urls: string[]
  excerpt: string | null
  category_id: number | null
  author_id: number
  visibility: string
  is_draft: boolean
  created_at: string
  updated_at: string | null
  author_email: string | null
  author_username: string | null
}

export type PostPage = {
  posts: Post[]
  next_cursor: string | null
}

export type SearchUserResult = {
  id: number
  username: string
}

export type SearchPostResult = Omit<Post, 'author_email'>

export type SearchResultsPage<T> = {
  items: T[]
  next_cursor: string | null
}

export type SearchResponse = {
  users: SearchResultsPage<SearchUserResult> | null
  posts: SearchResultsPage<SearchPostResult> | null
}

export type SearchSection = 'users' | 'posts'

export type PostComment = {
  id: number
  post_id: number
  user_id: number
  username: string | null
  content: string
  created_at: string
}

export type ProfileStats = {
  posts_count: number
  followers_count: number
  following_count: number
}

export type ProfileUser = {
  id: number
  username: string | null
}

export type UserProfile = {
  id: number
  username: string | null
  is_public: boolean
  is_self: boolean
  is_following: boolean
  has_pending_request: boolean
  can_view_posts: boolean
  posts_count: number
  followers_count: number
  following_count: number
}

type CloudinaryUploadResponse = {
  secure_url: string
}

export async function uploadPostImage(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary upload is not configured.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await axios.post<CloudinaryUploadResponse>(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
  )
  return response.data.secure_url
}

export async function listCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/posts/categories')
  return response.data
}

export async function listPosts(options: {
  cursor?: string | null
  categoryId?: number
} = {}): Promise<PostPage> {
  const response = await api.get<PostPage>('/posts', {
    params: {
      cursor: options.cursor ?? undefined,
      category_id: options.categoryId,
    },
  })
  return response.data
}

export async function getPost(postId: number): Promise<Post> {
  const response = await api.get<Post>(`/posts/${postId}`)
  return response.data
}

export async function searchGlobal(
  query: string,
  options: {
    section?: SearchSection
    cursor?: string | null
    signal?: AbortSignal
  } = {},
): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>('/search', {
    params: {
      q: query,
      section: options.section,
      cursor: options.cursor ?? undefined,
    },
    signal: options.signal,
  })
  return response.data
}

export async function listPostComments(postId: number): Promise<PostComment[]> {
  const response = await api.get<PostComment[]>(`/posts/${postId}/comments`)
  return response.data
}

export async function createPostComment(postId: number, content: string): Promise<PostComment> {
  const response = await api.post<PostComment>(`/posts/${postId}/comments`, { content })
  return response.data
}

export async function createPost(payload: CreatePostPayload): Promise<void> {
  await api.post('/posts', payload)
}

export async function updatePost(postId: number, payload: Partial<CreatePostPayload>): Promise<Post> {
  const response = await api.put<Post>(`/posts/${postId}`, payload)
  return response.data
}

export async function getMyProfileStats(): Promise<ProfileStats> {
  const response = await api.get<ProfileStats>('/social/me')
  return response.data
}

export async function listMyFollowers(): Promise<ProfileUser[]> {
  const response = await api.get<ProfileUser[]>('/social/me/followers')
  return response.data
}

export async function removeFollower(userId: number): Promise<void> {
  await api.delete(`/social/me/followers/${userId}`)
}

export async function listMyFollowing(): Promise<ProfileUser[]> {
  const response = await api.get<ProfileUser[]>('/social/me/following')
  return response.data
}

export async function listMyPosts(): Promise<Post[]> {
  const response = await api.get<Post[]>('/posts/me')
  return response.data
}

export async function listMyDrafts(): Promise<Post[]> {
  const response = await api.get<Post[]>('/posts/me/drafts')
  return response.data
}

export async function getMyDraft(postId: number): Promise<Post> {
  const response = await api.get<Post>(`/posts/me/drafts/${postId}`)
  return response.data
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`/social/users/${userId}`)
  return response.data
}

export async function listUserPosts(userId: number): Promise<Post[]> {
  const response = await api.get<Post[]>(`/posts/users/${userId}`)
  return response.data
}

export async function followUser(userId: number): Promise<void> {
  await api.post('/social/follow', { user_id: userId })
}

export async function unfollowUser(userId: number): Promise<void> {
  await api.delete(`/social/follow/${userId}`)
}

export async function sharePost(postId: number, recipientIds: number[]): Promise<number> {
  const response = await api.post<{ shared_count: number }>(`/posts/${postId}/share`, {
    recipient_ids: recipientIds,
  })
  return response.data.shared_count
}

export type NotificationItem = {
  id: number
  user_id: number
  actor_id: number | null
  type: string
  reference_id: number | null
  message: string
  is_read: boolean
  created_at: string
}

export async function markNotificationRead(notificationId: number): Promise<NotificationItem> {
  const response = await api.patch<NotificationItem>(`/notifications/${notificationId}/read`)
  return response.data
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>('/notifications')
  return response.data
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<{ count: number }>('/notifications/unread-count')
  return response.data.count
}

export async function respondToFollowRequest(
  notificationId: number,
  response: 'accept' | 'decline',
): Promise<NotificationItem> {
  const result = await api.post<NotificationItem>(
    `/social/follow-requests/${notificationId}/${response}`,
  )
  return result.data
}