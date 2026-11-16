import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
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
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useMediaQuery,
} from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../api/auth'
import { createPostComment, listPostComments, listPosts, updatePost, uploadPostImage, type Post, type PostComment } from '../api/posts'

const MAX_POST_IMAGE_COUNT = 10
const MAX_POST_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

function formatPostDate(value: string) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value))
}

export function PostCard({ post, canEdit = false }: { post: Post; canEdit?: boolean }) {
	console.log('Rendering PostCard for post:', post) // Debugging log
	const author = post.author_username || 'Memosphere member'
	const [displayTitle, setDisplayTitle] = useState(post.title)
	const [displayContent, setDisplayContent] = useState(post.content)
	const [displayImageUrls, setDisplayImageUrls] = useState(post.image_urls)
	const isNarrowScreen = useMediaQuery('(max-width: 599px)')
	const isMediumScreen = useMediaQuery('(min-width: 600px) and (max-width: 899px)')
	const contentPreviewLimit = isNarrowScreen ? 170 : isMediumScreen ? 400 : 640
	const canExpandContent = displayContent.length > contentPreviewLimit
	const [imagesOpen, setImagesOpen] = useState(false)
	const [contentExpanded, setContentExpanded] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [editTitle, setEditTitle] = useState(post.title)
	const [editContent, setEditContent] = useState(post.content)
	const [editImageUrls, setEditImageUrls] = useState(post.image_urls)
	const [isSavingEdit, setIsSavingEdit] = useState(false)
	const [isUploadingEditImages, setIsUploadingEditImages] = useState(false)
	const [editError, setEditError] = useState('')
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

	function openEditDialog() {
		setEditTitle(displayTitle)
		setEditContent(displayContent)
		setEditImageUrls(displayImageUrls)
		setEditError('')
		setIsEditOpen(true)
	}

	function removeEditImage(index: number) {
		setEditImageUrls((currentUrls) => currentUrls.filter((_, urlIndex) => urlIndex !== index))
	}

	async function handleEditImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? [])
		event.target.value = ''
		if (files.length === 0) return

		const availableSlots = MAX_POST_IMAGE_COUNT - editImageUrls.length
		const selectedFiles = files.slice(0, availableSlots)
		const rejectedCount = files.length - selectedFiles.length
		const validFiles = selectedFiles.filter(
			(file) => file.type.startsWith('image/') && file.size <= MAX_POST_IMAGE_SIZE_BYTES,
		)
		const invalidCount = selectedFiles.length - validFiles.length

		if (validFiles.length === 0) {
			setEditError(
				availableSlots <= 0
					? `A post can have up to ${MAX_POST_IMAGE_COUNT} images.`
					: 'Choose image files that are 10 MB or smaller.',
			)
			return
		}

		setEditError('')
		setIsUploadingEditImages(true)
		try {
			const results = await Promise.allSettled(validFiles.map(uploadPostImage))
			const uploadedUrls = results.flatMap((result) =>
				result.status === 'fulfilled' ? [result.value] : [],
			)
			setEditImageUrls((currentUrls) => [...currentUrls, ...uploadedUrls].slice(0, MAX_POST_IMAGE_COUNT))

			const failedCount = results.length - uploadedUrls.length
			const messages = [
				failedCount > 0 ? `${failedCount} image upload(s) failed.` : '',
				invalidCount > 0 ? `${invalidCount} file(s) were not valid images under 10 MB.` : '',
				rejectedCount > 0 ? `Only ${MAX_POST_IMAGE_COUNT} images can be added to a post.` : '',
			].filter(Boolean)
			if (messages.length > 0) setEditError(messages.join(' '))
		} finally {
			setIsUploadingEditImages(false)
		}
	}

	async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (isSavingEdit || isUploadingEditImages) return

		const title = editTitle.trim()
		const content = editContent.trim()
		if (!title || !content) return

		setIsSavingEdit(true)
		setEditError('')
		try {
			const updatedPost = await updatePost(post.id, {
				title,
				content,
				image_urls: editImageUrls,
			})
			setDisplayTitle(updatedPost.title)
			setDisplayContent(updatedPost.content)
			setDisplayImageUrls(updatedPost.image_urls)
			setIsEditOpen(false)
		} catch {
			setEditError('The post could not be updated. Please try again.')
		} finally {
			setIsSavingEdit(false)
		}
	}

	return (
		<Card
			component="article"
			variant="outlined"
			sx={{
				borderRadius: 1,
				my: 0.5,
				borderColor: 'rgba(31, 41, 51, 0.1)',
				bgcolor: 'background.paper',
				boxShadow: '0 6px 20px rgba(31, 41, 51, 0.11)',
				transition: 'box-shadow 180ms ease, border-color 180ms ease',
				'&:hover': {
					borderColor: 'rgba(23, 107, 135, 0.28)',
					boxShadow: '0 10px 26px rgba(31, 41, 51, 0.15)',
				},
			}}
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
						<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
							<Typography
								component="time"
								dateTime={post.created_at}
								variant="caption"
								color="text.secondary"
								sx={{ maxWidth: { xs: 120, sm: 180 }, textAlign: 'right', overflowWrap: 'anywhere' }}
							>
								{formatPostDate(post.created_at)}
							</Typography>
							{canEdit && (
								<Tooltip title="Edit post">
									<IconButton aria-label={`Edit post: ${displayTitle}`} size="small" onClick={openEditDialog}>
										<EditOutlinedIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							)}
						</Stack>
					</Stack>

					<Box>
						<Typography component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
							{displayTitle}
						</Typography>
						<Typography
							id={`post-${post.id}-content`}
							color="text.primary"
							sx={{
								mt: 1,
								whiteSpace: 'pre-wrap',
								overflowWrap: 'anywhere',
								...(canExpandContent && !contentExpanded
									? {
										display: '-webkit-box',
										WebkitBoxOrient: 'vertical',
										WebkitLineClamp: 5,
										overflow: 'hidden',
									}
									: {}),
							}}
						>
							{displayContent}
						</Typography>
						{canExpandContent && (
							<Button
								size="small"
								endIcon={contentExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
								aria-expanded={contentExpanded}
								aria-controls={`post-${post.id}-content`}
								onClick={() => setContentExpanded((expanded) => !expanded)}
								sx={{ alignSelf: 'flex-start', minWidth: 0, mt: -0.75, px: 0.5, textTransform: 'none' }}
							>
								{contentExpanded ? 'Show less' : 'Read more'}
							</Button>
						)}
					</Box>

					{displayImageUrls.length > 0 && (
						<>
							<Button
								startIcon={<ImageOutlinedIcon />}
								endIcon={imagesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
								aria-expanded={imagesOpen}
								aria-controls={`post-${post.id}-images`}
								onClick={() => setImagesOpen((open) => !open)}
								sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
							>
								{imagesOpen ? 'Hide images' : `Show images (${displayImageUrls.length})`}
							</Button>
							<Collapse id={`post-${post.id}-images`} in={imagesOpen} unmountOnExit sx={{ width: '100%' }}>
								<Box
									role="region"
									aria-label={`Images in ${post.title}`}
									sx={{
										display: 'flex',
										width: '100%',
										minWidth: 0,
										overflowX: 'auto',
										overflowY: 'hidden',
										gap: 1.5,
										pb: 1,
										overscrollBehaviorX: 'contain',
										scrollSnapType: 'x mandatory',
									}}
								>
									{displayImageUrls.map((url, index) => (
										<Box
											key={`${post.id}-${url}`}
											component="img"
											src={url}
											alt={`Image ${index + 1} in ${post.title}`}
											loading="lazy"
											sx={{
												display: 'block',
												flex: '0 0 min(76vw, 280px)',
												width: 'min(76vw, 280px)',
												aspectRatio: '4 / 3',
												maxWidth: '100%',
												objectFit: 'cover',
												borderRadius: 1,
												scrollSnapAlign: 'start',
											}}
										/>
									))}
								</Box>
							</Collapse>
						</>
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
			<Dialog open={isEditOpen} onClose={() => !isSavingEdit && setIsEditOpen(false)} fullWidth maxWidth="sm">
				<Box component="form" onSubmit={handleEditSubmit}>
					<DialogTitle>Edit post</DialogTitle>
					<DialogContent>
						<Stack spacing={2} sx={{ pt: 1 }}>
							{editError && <Alert severity="error">{editError}</Alert>}
							<TextField
								label="Title"
								value={editTitle}
								onChange={(event) => setEditTitle(event.target.value)}
								slotProps={{ htmlInput: { maxLength: 200 } }}
								required
								fullWidth
								disabled={isSavingEdit}
							/>
							<TextField
								label="Content"
								value={editContent}
								onChange={(event) => setEditContent(event.target.value)}
								slotProps={{ htmlInput: { maxLength: 5000 } }}
								required
								fullWidth
								multiline
								minRows={6}
								disabled={isSavingEdit}
							/>
											<Stack spacing={1}>
												<Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
													<Typography variant="subtitle2">Images ({editImageUrls.length}/{MAX_POST_IMAGE_COUNT})</Typography>
													<Button
														component="label"
														startIcon={<AddPhotoAlternateOutlinedIcon />}
														disabled={isSavingEdit || isUploadingEditImages || editImageUrls.length >= MAX_POST_IMAGE_COUNT}
													>
														{isUploadingEditImages ? 'Uploading...' : 'Add images'}
														<input hidden type="file" accept="image/*" multiple onChange={handleEditImageSelection} />
													</Button>
												</Stack>
												{editImageUrls.map((url, index) => (
													<Stack key={`${url}-${index}`} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
														<Box component="img" src={url} alt={`Post image ${index + 1}`} sx={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 1 }} />
														<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>Image {index + 1}</Typography>
														<Tooltip title={`Remove image ${index + 1}`}>
															<span>
																<IconButton
																	aria-label={`Remove image ${index + 1}`}
																	disabled={isSavingEdit || isUploadingEditImages}
																	onClick={() => removeEditImage(index)}
																	color="error"
																>
																	<ClearIcon />
																</IconButton>
															</span>
														</Tooltip>
													</Stack>
												))}
											</Stack>
						</Stack>
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 2 }}>
						<Button onClick={() => setIsEditOpen(false)} disabled={isSavingEdit || isUploadingEditImages}>Cancel</Button>
						<Button type="submit" variant="contained" disabled={isSavingEdit || isUploadingEditImages || !editTitle.trim() || !editContent.trim()}>
							{isUploadingEditImages ? 'Uploading...' : isSavingEdit ? 'Saving...' : 'Save changes'}
						</Button>
					</DialogActions>
				</Box>
			</Dialog>
		</Card>
	)
}

export function Allposts() {
	const [posts, setPosts] = useState<Post[]>([])
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isActive = true
		getCurrentUser()
			.then((currentUser) => {
				if (isActive) setCurrentUserId(currentUser.id)
			})
			.catch(() => undefined)

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
		<Stack component="section" aria-label="Posts" spacing={2.5} sx={{ width: '100%', maxWidth: 960, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 2, sm: 3 } }}>
			{posts.map((post) => <PostCard key={post.id} post={post} canEdit={post.author_id === currentUserId} />)}
		</Stack>
	)
}
