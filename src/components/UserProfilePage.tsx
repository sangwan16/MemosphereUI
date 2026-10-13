import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import { Alert, Avatar, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
	followUser,
	getUserProfile,
	listUserPosts,
	type Post,
	type UserProfile,
	unfollowUser,
} from '../api/posts'
import { PostCard } from './Allposts'

export function UserProfilePage() {
	const { userId } = useParams()
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [posts, setPosts] = useState<Post[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isPostsLoading, setIsPostsLoading] = useState(false)
	const [isFollowSaving, setIsFollowSaving] = useState(false)
	const [error, setError] = useState('')
	const [postsError, setPostsError] = useState('')
	const [followError, setFollowError] = useState('')
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isActive = true
		const id = Number(userId)
		setIsLoading(true)
		setError('')
		setPostsError('')

		async function loadProfile() {
			if (!Number.isInteger(id) || id <= 0) {
				setError('This profile could not be found.')
				setIsLoading(false)
				return
			}

			try {
				const loadedProfile = await getUserProfile(id)
				if (!isActive) return
				setProfile(loadedProfile)
				if (!loadedProfile.can_view_posts) {
					setPosts([])
					return
				}

				setIsPostsLoading(true)
				try {
					const loadedPosts = await listUserPosts(id)
					if (isActive) setPosts(loadedPosts)
				} catch {
					if (isActive) setPostsError('Posts could not be loaded.')
				} finally {
					if (isActive) setIsPostsLoading(false)
				}
			} catch {
				if (isActive) setError('This profile could not be loaded.')
			} finally {
				if (isActive) setIsLoading(false)
			}
		}

		void loadProfile()
		return () => {
			isActive = false
		}
	}, [userId, reloadKey])

	async function handleFollowToggle() {
		if (!profile || isFollowSaving) return

		setFollowError('')
		setIsFollowSaving(true)
		try {
			if (profile.is_following) {
				await unfollowUser(profile.id)
			} else {
				await followUser(profile.id)
			}
			setReloadKey((key) => key + 1)
		} catch {
			setFollowError(`Could not ${profile.is_following ? 'unfollow' : 'follow'} this user. Please try again.`)
		} finally {
			setIsFollowSaving(false)
		}
	}

	if (isLoading) {
		return <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress aria-label="Loading profile" /></Box>
	}

	if (error || !profile) {
		return (
			<Stack component="main" spacing={2} sx={{ width: '100%', maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
				<Button component={Link} to="/home" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>Home</Button>
				<Alert severity="error">{error || 'This profile could not be loaded.'}</Alert>
			</Stack>
		)
	}

	const displayName = profile.username || `Member #${profile.id}`

	return (
		<Stack component="main" spacing={3} sx={{ width: '100%', maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
			<Button component={Link} to="/home" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>Home</Button>
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
				<Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
					<Avatar sx={{ width: 64, height: 64, fontSize: 28 }}>{displayName.charAt(0).toUpperCase()}</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography component="h1" variant="h4" sx={{ overflowWrap: 'anywhere' }}>{displayName}</Typography>
						<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
							{!profile.is_public && <LockOutlinedIcon fontSize="small" />}
							<Typography variant="body2">{profile.is_public ? 'Public account' : 'Private account'}</Typography>
						</Stack>
					</Box>
				</Stack>
				{profile.is_self ? (
					<Button component={Link} to="/profile" variant="outlined">Edit profile</Button>
				) : (
					<Button
						variant={profile.is_following ? 'outlined' : 'contained'}
						startIcon={profile.is_following ? <PersonRemoveOutlinedIcon /> : <PersonAddAlt1Icon />}
						disabled={isFollowSaving}
						onClick={() => void handleFollowToggle()}
					>
						{isFollowSaving ? 'Saving...' : profile.is_following ? 'Unfollow' : 'Follow'}
					</Button>
				)}
			</Stack>

			{followError && <Alert severity="error">{followError}</Alert>}
			<Stack direction="row" spacing={3} sx={{ py: 1 }}>
				<Stack alignItems="center"><Typography variant="h6">{profile.posts_count}</Typography><Typography variant="body2" color="text.secondary">Posts</Typography></Stack>
				<Stack alignItems="center"><Typography variant="h6">{profile.followers_count}</Typography><Typography variant="body2" color="text.secondary">Followers</Typography></Stack>
				<Stack alignItems="center"><Typography variant="h6">{profile.following_count}</Typography><Typography variant="body2" color="text.secondary">Following</Typography></Stack>
			</Stack>

			{!profile.can_view_posts ? (
				<Alert severity="info">This account is private. Follow this user to see their posts.</Alert>
			) : (
				<Stack spacing={2}>
					<Typography component="h2" variant="h5">Posts</Typography>
					{isPostsLoading && <CircularProgress aria-label="Loading user posts" />}
					{postsError && <Alert severity="error">{postsError}</Alert>}
					{!isPostsLoading && !postsError && posts.length === 0 && (
						<Typography color="text.secondary">No posts yet.</Typography>
					)}
					{posts.map((post) => <PostCard key={post.id} post={post} />)}
				</Stack>
			)}
		</Stack>
	)
}
