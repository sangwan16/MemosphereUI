import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentUser } from '../api/auth'
import { listCategories, listPosts, type Category, type Post } from '../api/posts'
import { PostCard } from './Allposts'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'

export function CategoryFeed() {
	const { category: categorySlug } = useParams()
	const [category, setCategory] = useState<Category | null>(null)
	const [posts, setPosts] = useState<Post[]>([])
	const [currentUserId, setCurrentUserId] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [error, setError] = useState(false)
	const [loadMoreError, setLoadMoreError] = useState(false)
	const [nextCursor, setNextCursor] = useState<string | null>(null)
	const [reloadKey, setReloadKey] = useState(0)
	const isLoadingMoreRef = useRef(false)

	useEffect(() => {
		let isActive = true
		getCurrentUser()
			.then((currentUser) => {
				if (isActive) setCurrentUserId(currentUser.id)
			})
			.catch(() => undefined)
		setIsLoading(true)
		setError(false)

		listCategories()
			.then((categories) => {
				if (!isActive) return
				const selectedCategory = categories.find((item) => item.slug === categorySlug)
				if (!selectedCategory) {
					setCategory(null)
					setPosts([])
					setError(true)
					return null
				}

				setCategory(selectedCategory)
				return listPosts({ categoryId: selectedCategory.id })
			})
			.then((page) => {
				if (!isActive || !page) return
				setPosts(page.posts)
				setNextCursor(page.next_cursor)
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
	}, [categorySlug, reloadKey])

	async function loadMorePosts() {
		if (!nextCursor || isLoadingMoreRef.current || !category) return

		isLoadingMoreRef.current = true
		setIsLoadingMore(true)
		setLoadMoreError(false)
		try {
			const page = await listPosts({ categoryId: category.id, cursor: nextCursor })
			setPosts((currentPosts) => {
				const existingIds = new Set(currentPosts.map((post) => post.id))
				return [...currentPosts, ...page.posts.filter((post) => !existingIds.has(post.id))]
			})
			setNextCursor(page.next_cursor)
		} catch {
			setLoadMoreError(true)
		} finally {
			isLoadingMoreRef.current = false
			setIsLoadingMore(false)
		}
	}

	const sentinelRef = useInfiniteScroll(
		loadMorePosts,
		Boolean(nextCursor) && !isLoadingMore && !loadMoreError && Boolean(category),
	)

	if (isLoading) {
		return <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress aria-label="Loading category feed" /></Box>
	}

	if (error) {
		return (
			<Alert
				severity="error"
				action={<Button color="inherit" size="small" onClick={() => setReloadKey((key) => key + 1)}>Retry</Button>}
			>
				{categorySlug ? 'This category feed could not be loaded.' : 'Category not found.'}
			</Alert>
		)
	}

	return (
		<Stack component="main" spacing={2.5} sx={{ width: '100%', maxWidth: 960, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 2 }}>
			{/* <Typography component="h1" variant="h4">{category?.name}</Typography> */}
			{posts.length === 0 ? (
				<Stack spacing={1} sx={{ py: 8, color: 'text.secondary', alignItems: 'center' }}>
					<ArticleOutlinedIcon />
					<Typography>No posts in this category yet.</Typography>
				</Stack>
			) : posts.map((post) => <PostCard key={post.id} post={post} canEdit={post.author_id === currentUserId} />)}
			{loadMoreError && <Alert severity="error">More posts could not be loaded.</Alert>}
			{nextCursor && (
				<>
					<Button variant="outlined" onClick={loadMorePosts} disabled={isLoadingMore}>
						{isLoadingMore ? <CircularProgress size={20} aria-label="Loading more posts" /> : loadMoreError ? 'Retry' : 'Load more'}
					</Button>
					<Box ref={sentinelRef} aria-hidden="true" sx={{ height: 1 }} />
				</>
			)}
		</Stack>
	)
}
