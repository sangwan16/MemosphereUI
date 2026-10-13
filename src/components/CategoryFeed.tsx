import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { listCategories, listPosts, type Category, type Post } from '../api/posts'
import { PostCard } from './Allposts'

export function CategoryFeed() {
	const { category: categorySlug } = useParams()
	const [category, setCategory] = useState<Category | null>(null)
	const [posts, setPosts] = useState<Post[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isActive = true
		setIsLoading(true)
		setError(false)

		Promise.all([listCategories(), listPosts()])
			.then(([categories, allPosts]) => {
				if (!isActive) return
				const selectedCategory = categories.find((item) => item.slug === categorySlug)
				if (!selectedCategory) {
					setCategory(null)
					setPosts([])
					setError(true)
					return
				}

				setCategory(selectedCategory)
				setPosts(allPosts.filter((post) => post.category_id === selectedCategory.id))
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
		<Stack component="main" spacing={2} sx={{ width: '100%', maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
			{/* <Typography component="h1" variant="h4">{category?.name}</Typography> */}
			{posts.length === 0 ? (
				<Stack spacing={1} sx={{ py: 8, color: 'text.secondary', alignItems: 'center' }}>
					<ArticleOutlinedIcon />
					<Typography>No posts in this category yet.</Typography>
				</Stack>
			) : posts.map((post) => <PostCard key={post.id} post={post} />)}
		</Stack>
	)
}
