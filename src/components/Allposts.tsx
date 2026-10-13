import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined'
import SendIcon from '@mui/icons-material/Send'
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Collapse,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createPostComment, listPostComments, listPosts, type Post, type PostComment } from '../api/posts'

function formatPostDate(value: string) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value))
}

export function PostCard({ post }: { post: Post }) {
	console.log('Rendering PostCard for post:', post) // Debugging log
	const author = post.author_username || 'Memosphere member'
	const [comments, setComments] = useState<PostComment[]>([])
	const [commentsOpen, setCommentsOpen] = useState(false)
	const [commentsLoaded, setCommentsLoaded] = useState(false)
	const [commentsLoading, setCommentsLoading] = useState(false)
	const [commentsError, setCommentsError] = useState(false)
	const [commentsRetryKey, setCommentsRetryKey] = useState(0)
	const [commentText, setCommentText] = useState('')
	const [isSubmittingComment, setIsSubmittingComment] = useState(false)
	const [commentSubmitError, setCommentSubmitError] = useState(false)

	useEffect(() => {
		if (!commentsOpen || commentsLoaded) return

		let isActive = true
		setCommentsLoading(true)
		setCommentsError(false)
		listPostComments(post.id)
			.then((loadedComments) => {
				if (!isActive) return
				setComments(loadedComments)
				setCommentsLoaded(true)
			})
			.catch(() => {
				if (isActive) setCommentsError(true)
			})
			.finally(() => {
				if (isActive) setCommentsLoading(false)
			})

		return () => {
			isActive = false
		}
	}, [commentsOpen, commentsLoaded, commentsRetryKey, post.id])

	async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const content = commentText.trim()
		if (!content || isSubmittingComment) return

		setIsSubmittingComment(true)
		setCommentSubmitError(false)
		try {
			const createdComment = await createPostComment(post.id, content)
			setComments((currentComments) => [...currentComments, createdComment])
			setCommentsLoaded(true)
			setCommentText('')
		} catch {
			setCommentSubmitError(true)
		} finally {
			setIsSubmittingComment(false)
		}
	}

	return (
		<Card
			component="article"
			variant="outlined"
			sx={{ borderRadius: 1, borderColor: 'divider' }}
		>
			<CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
				<Stack spacing={2}>
					  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0 }}>
						<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
						<Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
							{author.charAt(0).toUpperCase()}
						</Avatar>
						<Box sx={{ minWidth: 0 }}>
							<Typography
								component={Link}
								to={`/users/${post.author_id}`}
								variant="subtitle2"
								sx={{ color: 'text.primary', textDecoration: 'none', overflowWrap: 'anywhere', '&:hover': { textDecoration: 'underline' } }}
							>
								{author}
							</Typography>
						</Box>
						</Stack>
						<Typography
							component="time"
							dateTime={post.created_at}
							variant="caption"
							color="text.secondary"
							sx={{ maxWidth: '48%', textAlign: 'right', overflowWrap: 'anywhere' }}
						>
							{formatPostDate(post.created_at)}
						</Typography>
					</Stack>

					<Box>
						<Typography component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
							{post.title}
						</Typography>
						<Typography
							color="text.primary"
							sx={{ mt: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
						>
							{post.content}
						</Typography>
					</Box>

					{post.image_urls.length > 0 && (
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: post.image_urls.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
								gap: 1,
							}}
						>
							{post.image_urls.map((url, index) => (
								<Box
									key={`${post.id}-${url}`}
									component="img"
									src={url}
									alt={`Image ${index + 1} in ${post.title}`}
									loading="lazy"
									sx={{
										display: 'block',
										width: '100%',
										aspectRatio: '4 / 3',
										objectFit: 'cover',
										borderRadius: 1,
									}}
								/>
							))}
						</Box>
					)}

					<Button
						startIcon={<CommentOutlinedIcon />}
						aria-expanded={commentsOpen}
						onClick={() => setCommentsOpen((open) => !open)}
						sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
					>
						{commentsOpen ? 'Hide comments' : 'Comments'}
					</Button>

					<Collapse in={commentsOpen} unmountOnExit sx={{ width: '100%' }}>
						<Stack spacing={2}>
							{commentsLoading && <CircularProgress size={22} aria-label="Loading comments" />}
							{commentsError && (
								<Alert
									severity="error"
									action={
										<Button color="inherit" size="small" onClick={() => setCommentsRetryKey((key) => key + 1)}>
											Retry
										</Button>
									}
								>
									Comments could not be loaded.
								</Alert>
							)}
							{commentsLoaded && comments.length === 0 && (
								<Typography color="text.secondary" variant="body2">No comments yet.</Typography>
							)}
							{comments.map((comment) => (
								<Box key={comment.id} sx={{ borderLeft: 2, borderColor: 'divider', pl: 1.5 }}>
									<Typography variant="caption" color="text.secondary">
										{comment.username || `Member #${comment.user_id}`} · {formatPostDate(comment.created_at)}
									</Typography>
									<Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
										{comment.content}
									</Typography>
								</Box>
							))}

							<Box component="form" onSubmit={handleCommentSubmit}>
								<Stack spacing={1}>
									<TextField
										label="Write a comment"
										value={commentText}
										onChange={(event) => setCommentText(event.target.value)}
										multiline
										minRows={2}
										maxRows={5}
										slotProps={{ htmlInput: { maxLength: 1000 } }}
										disabled={isSubmittingComment}
									/>
									{commentSubmitError && <Alert severity="error">Your comment could not be posted. Please try again.</Alert>}
									<Button
										type="submit"
										variant="contained"
										startIcon={<SendIcon />}
										disabled={!commentText.trim() || isSubmittingComment}
										sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
									>
										{isSubmittingComment ? 'Posting...' : 'Post comment'}
									</Button>
								</Stack>
							</Box>
						</Stack>
					</Collapse>
				</Stack>
			</CardContent>
		</Card>
	)
}

export function Allposts() {
	const [posts, setPosts] = useState<Post[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isActive = true

		setIsLoading(true)
		setError(false)
		listPosts()
			.then((loadedPosts) => {
				if (isActive) setPosts(loadedPosts)
			})
			.catch(() => {
				if (isActive) setError(true)
			})
			.finally(() => {
				if (isActive) setIsLoading(false)
			})

		return () => {
			isActive = false
		}
	}, [reloadKey])

	if (isLoading) {
		return (
			<Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
				<CircularProgress aria-label="Loading posts" />
			</Box>
		)
	}

	if (error) {
		return (
			<Alert
				severity="error"
				action={
					<Button color="inherit" size="small" onClick={() => setReloadKey((key) => key + 1)}>
						Retry
					</Button>
				}
			>
				Posts could not be loaded.
			</Alert>
		)
	}

	if (posts.length === 0) {
		return (
			<Stack spacing={1} sx={{ py: 8, color: 'text.secondary', alignItems: 'center' }}>
				<ArticleOutlinedIcon />
				<Typography>No posts to show yet.</Typography>
			</Stack>
		)
	}

	return (
		<Stack component="section" aria-label="Posts" spacing={2} sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
			{posts.map((post) => <PostCard key={post.id} post={post} />)}
		</Stack>
	)
}
