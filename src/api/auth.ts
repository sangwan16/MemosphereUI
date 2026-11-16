 import axios from 'axios'

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
})

const accessTokenKey = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'memosphere.accessToken'
const refreshTokenKey = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'memosphere.refreshToken'

export type MessageResponse = {
	message: string
}

export type TokenResponse = {
	access_token: string
	refresh_token?: string
	token_type: string
}

export type CurrentUser = {
	id: number
	email: string
	username: string | null
	is_active: boolean
	is_email_verified: boolean
	is_public: boolean
}

const verificationRequests = new Map<string, Promise<TokenResponse>>()
let refreshRequest: Promise<string> | null = null

function storeTokens(tokens: TokenResponse) {
	localStorage.setItem(accessTokenKey, tokens.access_token)
	if (tokens.refresh_token) {
		localStorage.setItem(refreshTokenKey, tokens.refresh_token)
	}
}

api.interceptors.request.use((config) => {
	const accessToken = localStorage.getItem(accessTokenKey)
	if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
	return config
})

export async function signup(email: string, password: string, username: string): Promise<MessageResponse> {
	const response = await api.post<MessageResponse>('/auth/signup', { email, password, username })
	return response.data
}

export async function verifyEmail(token: string): Promise<TokenResponse> {
	let request = verificationRequests.get(token)
	if (!request) {
		request = api.post<TokenResponse>('/auth/verify-email', { token }).then(({ data }) => {
			storeTokens(data)
			return data
		})
		verificationRequests.set(token, request)
	}
	return request
}

export async function resendVerification(email: string): Promise<MessageResponse> {
	const response = await api.post<MessageResponse>('/auth/resend-verification', { email })
	return response.data
}

export async function login(email: string, password: string): Promise<TokenResponse> {
	const formData = new URLSearchParams({ username: email, password })
	const response = await api.post<TokenResponse>('/auth/token', formData, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	})

	storeTokens(response.data)
	return response.data
}

export async function refreshAccessToken(): Promise<string> {
	const refreshToken = localStorage.getItem(refreshTokenKey)
	if (!refreshToken) throw new Error('No refresh token is available.')

	const response = await api.post<TokenResponse>('/auth/refresh', {
		refresh_token: refreshToken,
	})
	localStorage.setItem(accessTokenKey, response.data.access_token)
	return response.data.access_token
}

api.interceptors.response.use(
	(response) => response,
	async (error: unknown) => {
		if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
			return Promise.reject(error)
		}

		const request = error.config as typeof error.config & { _retry?: boolean }
		if (
			request._retry ||
			request.url?.endsWith('/auth/refresh') ||
			request.url?.endsWith('/auth/token')
		) {
			return Promise.reject(error)
		}

		request._retry = true
		try {
			refreshRequest ??= refreshAccessToken().finally(() => {
				refreshRequest = null
			})
			const accessToken = await refreshRequest
			request.headers.set('Authorization', `Bearer ${accessToken}`)
			return api(request)
		} catch (refreshError) {
			clearTokens()
			return Promise.reject(refreshError)
		}
	},
)

export async function getCurrentUser(): Promise<CurrentUser> {
	const response = await api.get<CurrentUser>('/auth/me')
	return response.data
}

export async function updateUsername(username: string): Promise<CurrentUser> {
	const response = await api.patch<CurrentUser>('/auth/me', { username })
	return response.data
}

export async function updateAccountPrivacy(isPublic: boolean): Promise<CurrentUser> {
	const response = await api.patch<CurrentUser>('/auth/me/privacy', { is_public: isPublic })
	return response.data
}

export function getAccessToken(): string | null {
	return localStorage.getItem(accessTokenKey)
}

export function clearTokens(): void {
	localStorage.removeItem(accessTokenKey)
	localStorage.removeItem(refreshTokenKey)
}
