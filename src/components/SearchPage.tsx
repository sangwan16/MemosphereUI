import SearchIcon from '@mui/icons-material/Search'
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchGlobal, type SearchPostResult, type SearchUserResult } from '../api/posts'
import { PostCard } from './Allposts'

export function SearchPage() {
	const [searchParams, setSearchParams] = useSearchParams()
	const committedQuery = (searchParams.get('q') ?? '').trim()
	const [queryText, setQueryText] = useState(committedQuery)
	const [users, setUsers] = useState<SearchUserResult[]>([])
	const [posts, setPosts] = useState<SearchPostResult[]>([])
	const [usersCursor, setUsersCursor] = useState<string | null>(null)
	const [postsCursor, setPostsCursor] = useState<string | null>(null)
	const [isSearching, setIsSearching] = useState(false)
	const [searchError, setSearchError] = useState(false)
	const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false)
	const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false)
	const [usersLoadError, setUsersLoadError] = useState(false)
	const [postsLoadError, setPostsLoadError] = useState(false)
	const [retryKey, setRetryKey] = useState(0)
	const searchGenerationRef = useRef(0)
	const usersLoadingRef = useRef(false)
	const postsLoadingRef = useRef(false)
	const usersControllerRef = useRef<AbortController | null>(null)
	const postsControllerRef = useRef<AbortController | null>(null)
	const queryPending = queryText.trim() !== committedQuery

	useEffect(() => {
		setQueryText(committedQuery)
	}, [committedQuery])

	useEffect(() => {
		const query = queryText.trim()
		if (query === committedQuery) return

		const timeoutId = window.setTimeout(() => {
			const nextParams = new URLSearchParams(searchParams)
			if (query) {
				nextParams.set('q', query)
			} else {
				nextParams.delete('q')
			}
			setSearchParams(nextParams, { replace: true })
		}, 300)

		return () => window.clearTimeout(timeoutId)
	}, [committedQuery, queryText, searchParams, setSearchParams])

	useEffect(() => {
		const generation = ++searchGenerationRef.current
		usersControllerRef.current?.abort()
		postsControllerRef.current?.abort()
		usersControllerRef.current = null
		postsControllerRef.current = null
		usersLoadingRef.current = false
		postsLoadingRef.current = false
		setUsers([])
		setPosts([])
		setUsersCursor(null)
		setPostsCursor(null)
		setIsLoadingMoreUsers(false)
		setIsLoadingMorePosts(false)
		setUsersLoadError(false)
		setPostsLoadError(false)
		setSearchError(false)

		if (committedQuery.length < 2) {
			setIsSearching(false)
			return () => {
				if (searchGenerationRef.current === generation) searchGenerationRef.current += 1
			}
		}

		const controller = new AbortController()
		let isActive = true
		setIsSearching(true)
		searchGlobal(committedQuery, { signal: controller.signal })
			.then((result) => {
				if (!isActive) return
				setUsers(result.users?.items ?? [])
				setPosts(result.posts?.items ?? [])
				setUsersCursor(result.users?.next_cursor ?? null)
				setPostsCursor(result.posts?.next_cursor ?? null)
			})
			.catch(() => {
				if (isActive && !controller.signal.aborted) setSearchError(true)
			})
			.finally(() => {
				if (isActive) setIsSearching(false)
			})

		return () => {
			isActive = false
			controller.abort()
			usersControllerRef.current?.abort()
			postsControllerRef.current?.abort()
			usersControllerRef.current = null
			postsControllerRef.current = null
			usersLoadingRef.current = false
			postsLoadingRef.current = false
			if (searchGenerationRef.current === generation) searchGenerationRef.current += 1
		}
	}, [committedQuery, retryKey])

	async function loadMoreUsers() {
		if (
			!usersCursor ||
			usersLoadingRef.current ||
			queryPending ||
			committedQuery.length < 2
		) {
			return
		}

		const generation = searchGenerationRef.current
		const controller = new AbortController()
		usersControllerRef.current = controller
		usersLoadingRef.current = true
		setIsLoadingMoreUsers(true)
		setUsersLoadError(false)
		try {
			const result = await searchGlobal(committedQuery, {
				section: 'users',
				cursor: usersCursor,
				signal: controller.signal,
			})
			if (generation !== searchGenerationRef.current) return
			const page = result.users
			if (!page) throw new Error('The search response did not include user results.')
			setUsers((currentUsers) => {
				const existingIds = new Set(currentUsers.map((user) => user.id))
				return [...currentUsers, ...page.items.filter((user) => !existingIds.has(user.id))]
			})
			setUsersCursor(page.next_cursor)
		} catch {
			if (generation === searchGenerationRef.current && !controller.signal.aborted) {
				setUsersLoadError(true)
			}
		} finally {
			if (usersControllerRef.current === controller) {
				usersControllerRef.current = null
				usersLoadingRef.current = false
				if (generation === searchGenerationRef.current) setIsLoadingMoreUsers(false)
			}
		}
	}

	async function loadMorePosts() {
		if (
			!postsCursor ||
			postsLoadingRef.current ||
			queryPending ||
			committedQuery.length < 2
		) {
			return
		}

		const generation = searchGenerationRef.current
		const controller = new AbortController()
		postsControllerRef.current = controller
		postsLoadingRef.current = true
		setIsLoadingMorePosts(true)
		setPostsLoadError(false)
		try {
			const result = await searchGlobal(committedQuery, {
				section: 'posts',
				cursor: postsCursor,
				signal: controller.signal,
			})
			if (generation !== searchGenerationRef.current) return
			const page = result.posts
			if (!page) throw new Error('The search response did not include post results.')
			setPosts((currentPosts) => {
				const existingIds = new Set(currentPosts.map((post) => post.id))
				return [...currentPosts, ...page.items.filter((post) => !existingIds.has(post.id))]
			})
			setPostsCursor(page.next_cursor)
		} catch {
			if (generation === searchGenerationRef.current && !controller.signal.aborted) {
				setPostsLoadError(true)
			}
		} finally {
			if (postsControllerRef.current === controller) {
				postsControllerRef.current = null
				postsLoadingRef.current = false
				if (generation === searchGenerationRef.current) setIsLoadingMorePosts(false)
			}
		}
	}

	function updateQueryInUrl(query: string) {
		const nextParams = new URLSearchParams(searchParams)
		const normalizedQuery = query.trim()
		if (normalizedQuery) {
			nextParams.set('q', normalizedQuery)
		} else {
			nextParams.delete('q')
		}
		setSearchParams(nextParams, { replace: true })
	}

	function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const normalizedQuery = queryText.trim()
		if (normalizedQuery === committedQuery) {
			setRetryKey((key) => key + 1)
			return
		}
		updateQueryInUrl(normalizedQuery)
	}

	return (
		<Stack
			component="main"
			spacing={3}
			sx={{ width: '100%', maxWidth: 960, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 3, sm: 4 } }}
		>
			<Typography component="h1" variant="h4">Search</Typography>
			<Box component="form" onSubmit={handleSearchSubmit}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
					<TextField
						label="Search users and posts"
						placeholder="Try a username, title, or phrase"
						value={queryText}
						onChange={(event) => setQueryText(event.target.value)}
						slotProps={{ htmlInput: { maxLength: 100 } }}
						fullWidth
					/>
					<Button type="submit" variant="contained" startIcon={<SearchIcon />}>
						Search
					</Button>
				</Stack>
			</Box>

			{queryText.trim().length < 2 && (
				<Typography color="text.secondary">
					Enter at least 2 characters to search.
				</Typography>
			)}
			{queryPending && queryText.trim().length >= 2 && (
				<Typography color="text.secondary">Waiting to search…</Typography>
			)}
			{isSearching && (
				<Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
					<CircularProgress aria-label="Searching" />
				</Box>
			)}
			{searchError && !isSearching && !queryPending && (
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={() => setRetryKey((key) => key + 1)}>
							Retry
						</Button>
					}
				>
					Search results could not be loaded.
				</Alert>
			)}

			{committedQuery.length >= 2 && !queryPending && !isSearching && !searchError && (
				<>
					<Box component="section" aria-label="People search results">
						<Stack spacing={1.5}>
							<Typography component="h2" variant="h5">People</Typography>
							{users.length === 0 ? (
								<Typography color="text.secondary">No matching users.</Typography>
							) : (
								users.map((user) => (
									<Card key={user.id} variant="outlined">
										<CardContent sx={{ '&:last-child': { pb: 2 } }}>
											<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
												<Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
												<Typography
													component={Link}
													to={`/users/${user.id}`}
													color="text.primary"
													sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
												>
													@{user.username}
												</Typography>
											</Stack>
										</CardContent>
									</Card>
								))
							)}
							{usersLoadError && (
								<Alert
									severity="error"
									action={<Button color="inherit" size="small" onClick={loadMoreUsers}>Retry</Button>}
								>
									More users could not be loaded.
								</Alert>
							)}
							{usersCursor && (
								<Button
									variant="outlined"
									onClick={loadMoreUsers}
									disabled={isLoadingMoreUsers || queryPending}
								>
									{isLoadingMoreUsers ? <CircularProgress size={20} aria-label="Loading more users" /> : 'Load more users'}
								</Button>
							)}
						</Stack>
					</Box>

					<Box component="section" aria-label="Post search results">
						<Stack spacing={2}>
							<Typography component="h2" variant="h5">Posts</Typography>
							{posts.length === 0 ? (
								<Typography color="text.secondary">No matching posts.</Typography>
							) : (
								posts.map((post) => (
									<PostCard
										key={post.id}
										post={{ ...post, author_email: null }}
									/>
								))
							)}
							{postsLoadError && (
								<Alert
									severity="error"
									action={<Button color="inherit" size="small" onClick={loadMorePosts}>Retry</Button>}
								>
									More posts could not be loaded.
								</Alert>
							)}
							{postsCursor && (
								<Button
									variant="outlined"
									onClick={loadMorePosts}
									disabled={isLoadingMorePosts || queryPending}
								>
									{isLoadingMorePosts ? <CircularProgress size={20} aria-label="Loading more posts" /> : 'Load more posts'}
								</Button>
							)}
						</Stack>
					</Box>
				</>
			)}
		</Stack>
	)
}
