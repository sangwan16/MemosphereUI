import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(
    import.meta.env.VITE_ACCESS_TOKEN_KEY ?? 'memosphere.accessToken',
  )

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

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

export async function listPosts(): Promise<Post[]> {
  const response = await api.get<Post[]>('/posts')
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

export async function getMyProfileStats(): Promise<ProfileStats> {
  const response = await api.get<ProfileStats>('/social/me')
  return response.data
}

export async function listMyFollowers(): Promise<ProfileUser[]> {
  const response = await api.get<ProfileUser[]>('/social/me/followers')
  return response.data
}

export async function listMyFollowing(): Promise<ProfileUser[]> {
  const response = await api.get<ProfileUser[]>('/social/me/following')
  return response.data
}

export async function listMyPosts(): Promise<Post[]> {
  const response = await api.get<Post[]>('/posts/me')
  return response.data
}