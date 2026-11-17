import axios from 'axios'
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPost, type Post } from '../api/posts'
import { PostCard } from './Allposts'

export function PostDetailPage() {
	const { postId } = useParams()
	const [post, setPost] = useState<Post | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [unavailable, setUnavailable] = useState(false)
	const [loadError, setLoadError] = useState(false)
	const [retryKey, setRetryKey] = useState(0)

	useEffect(() => {
		let isActive = true
		const id = Number(postId)
		setIsLoading(true)
		setPost(null)
		setUnavailable(false)
		setLoadError(false)

		if (!Number.isInteger(id) || id <= 0) {
			setUnavailable(true)
			setIsLoading(false)
			return () => {
				isActive = false
			}
		}

		getPost(id)
			.then((loadedPost) => {
				if (isActive) setPost(loadedPost)
			})
			.catch((error: unknown) => {
				if (!isActive) return
				if (axios.isAxiosError(error) && error.response?.status === 404) {
					setUnavailable(true)
				} else {
					setLoadError(true)
				}
			})
			.finally(() => {
				if (isActive) setIsLoading(false)
			})

		return () => {
			isActive = false
		}
	}, [postId, retryKey])

	if (isLoading) {
		return <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress aria-label="Loading post" /></Box>
	}

	return (
		<Stack component="main" spacing={2} sx={{ width: '100%', maxWidth: 960, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
			<Button component={Link} to="/home" sx={{ alignSelf: 'flex-start' }}>Back to home</Button>
			{unavailable && (
				<Alert severity="info">
					This post isn’t available to you. It may have been deleted, or its visibility settings may not allow access.
				</Alert>
			)}
			{loadError && (
				<Alert
					severity="error"
					action={<Button color="inherit" size="small" onClick={() => setRetryKey((key) => key + 1)}>Retry</Button>}
				>
					The post could not be loaded.
				</Alert>
			)}
			{post && <PostCard post={post} />}
		</Stack>
	)
}
