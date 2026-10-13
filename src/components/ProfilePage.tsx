import axios from 'axios'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { clearTokens, getCurrentUser, updateAccountPrivacy, updateUsername, type CurrentUser } from '../api/auth'
import {
	getMyProfileStats,
	listMyFollowers,
	listMyFollowing,
	listMyPosts,
	type Post,
	type ProfileStats,
	type ProfileUser,
} from '../api/posts'
import { PostCard } from './Allposts'

export function ProfilePage() {
	const { section } = useParams()
	const navigate = useNavigate()
	const [user, setUser] = useState<CurrentUser | null>(null)
	const [stats, setStats] = useState<ProfileStats | null>(null)
	const [people, setPeople] = useState<ProfileUser[]>([])
	const [posts, setPosts] = useState<Post[]>([])
	const [username, setUsername] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSectionLoading, setIsSectionLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPrivacySaving, setIsPrivacySaving] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = useState(false)
	const [error, setError] = useState('')
	const [privacyError, setPrivacyError] = useState('')
	const [sectionError, setSectionError] = useState('')
	const [notice, setNotice] = useState('')

	useEffect(() => {
		let isActive = true
		getCurrentUser()
			.then((currentUser) => {
				if (!isActive) return
				setUser(currentUser)
				setUsername(currentUser.username ?? '')
			})
			.catch(() => {
				if (isActive) setError('Your profile could not be loaded.')
			})
			.finally(() => {
				if (isActive) setIsLoading(false)
			})

		return () => {
			isActive = false
		}
	}, [])

	useEffect(() => {
		let isActive = true
		getMyProfileStats()
			.then((profileStats) => {
				if (isActive) setStats(profileStats)
			})
			.catch(() => {
				if (isActive) setSectionError('Profile statistics could not be loaded.')
			})

		return () => {
			isActive = false
		}
	}, [])

	useEffect(() => {
		if (!section) return

		let isActive = true
		setIsSectionLoading(true)
		setSectionError('')
		if (section === 'followers' || section === 'following') {
			const loadPeople = section === 'followers' ? listMyFollowers : listMyFollowing
			loadPeople()
				.then((loadedPeople) => {
					if (isActive) setPeople(loadedPeople)
				})
				.catch(() => {
					if (isActive) setSectionError('This list could not be loaded.')
				})
				.finally(() => {
					if (isActive) setIsSectionLoading(false)
				})
		} else if (section === 'posts') {
			listMyPosts()
				.then((loadedPosts) => {
					if (isActive) setPosts(loadedPosts)
				})
				.catch(() => {
					if (isActive) setSectionError('Your posts could not be loaded.')
				})
				.finally(() => {
					if (isActive) setIsSectionLoading(false)
				})
		} else {
			setSectionError('This profile section does not exist.')
			setIsSectionLoading(false)
		}

		return () => {
			isActive = false
		}
	}, [section])

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		setNotice('')
		setIsSaving(true)
		try {
			const updatedUser = await updateUsername(username.trim())
			setUser(updatedUser)
			setUsername(updatedUser.username ?? '')
			setIsEditing(false)
			setNotice('Username updated.')
		} catch (requestError) {
			const detail = axios.isAxiosError<{ detail?: string }>(requestError)
				? requestError.response?.data?.detail
				: undefined
			setError(detail || 'Your username could not be updated. Please try again.')
		} finally {
			setIsSaving(false)
		}
	}

	async function handlePrivacyChange(isPublic: boolean) {
		if (!user || isPrivacySaving) return

		setPrivacyError('')
		setIsPrivacySaving(true)
		try {
			setUser(await updateAccountPrivacy(isPublic))
		} catch {
			setPrivacyError('Account privacy could not be updated. Please try again.')
		} finally {
			setIsPrivacySaving(false)
		}
	}

	function handleLogout() {
		clearTokens()
		setIsPrivacySettingsOpen(false)
		navigate('/auth', { replace: true })
	}

	if (isLoading) {
		return <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress aria-label="Loading profile" /></Box>
	}

	return (
		<Box component="main" sx={{ width: '100%', maxWidth: 520, mx: 'auto', p: { xs: 2, sm: 3 } }}>
			<Stack spacing={2}>
				{section ? (
					<>
						<Button component={Link} to="/profile" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
							Profile
						</Button>
						<Typography component="h1" variant="h4">
							{section === 'followers' ? 'Followers' : section === 'following' ? 'Following' : section === 'posts' ? 'Posts' : 'Profile'}
						</Typography>
						{sectionError && <Alert severity="error">{sectionError}</Alert>}
						{isSectionLoading && <CircularProgress aria-label={`Loading ${section}`} />}
						{!isSectionLoading && (section === 'followers' || section === 'following') && !sectionError && (
							<Stack spacing={1}>
								{people.length === 0 ? <Typography color="text.secondary">No users to show yet.</Typography> : people.map((person) => (
									<Button
										key={person.id}
										component={Link}
										to={`/users/${person.id}`}
										startIcon={<Avatar>{(person.username || 'M').charAt(0).toUpperCase()}</Avatar>}
										color="inherit"
										sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
									>
										{person.username || `Member #${person.id}`}
									</Button>
								))}
							</Stack>
						)}
						{!isSectionLoading && section === 'posts' && !sectionError && (
							<Stack spacing={2}>
								{posts.length === 0 ? <Typography color="text.secondary">No posts yet.</Typography> : posts.map((post) => (
									<PostCard key={post.id} post={post} />
								))}
							</Stack>
						)}
					</>
				) : (
					<>
						<Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
							<Typography component="h1" variant="h4">Profile</Typography>
							<Tooltip title="Profile settings">
								<IconButton aria-label="Profile settings" onClick={() => setIsPrivacySettingsOpen(true)}>
									<SettingsOutlinedIcon />
								</IconButton>
							</Tooltip>
						</Stack>
						{stats ? (
							<Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', py: 1 }}>
								{[
									{ label: 'Posts', count: stats.posts_count, to: '/profile/posts' },
									{ label: 'Followers', count: stats.followers_count, to: '/profile/followers' },
									{ label: 'Following', count: stats.following_count, to: '/profile/following' },
								].map((item) => (
									<Button
										key={item.label}
										component={Link}
										to={item.to}
										color="inherit"
										sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, textTransform: 'none' }}
									>
										<Typography variant="h6">{item.count}</Typography>
										<Typography variant="body2">{item.label}</Typography>
									</Button>
								))}
							</Stack>
						) : <CircularProgress size={24} aria-label="Loading profile statistics" />}
						{sectionError && <Alert severity="error">{sectionError}</Alert>}
					</>
				)}
				{error && <Alert severity="error">{error}</Alert>}
				{notice && <Alert severity="success">{notice}</Alert>}
				{user && !section && (
					<Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
						{isEditing ? (
							<Box component="form" onSubmit={handleSubmit}>
								<Stack spacing={2}>
									<TextField label="Email" value={user.email} fullWidth disabled />
									<TextField
										label="Username"
										value={username}
										onChange={(event) => setUsername(event.target.value)}
										required
										fullWidth
										autoComplete="username"
										helperText="3-30 characters: letters, numbers, and underscores."
										slotProps={{ htmlInput: { minLength: 3, maxLength: 30, pattern: '[A-Za-z0-9_]+' } }}
									/>
									<Stack direction="row" spacing={1}>
										<Button type="submit" variant="contained" disabled={isSaving || !username.trim()}>
											{isSaving ? 'Saving...' : 'Save username'}
										</Button>
										<Button
											disabled={isSaving}
											onClick={() => {
												setUsername(user.username ?? '')
												setError('')
												setIsEditing(false)
											}}
										>
											Cancel
										</Button>
									</Stack>
								</Stack>
							</Box>
						) : (
							<Stack spacing={1}>
								<Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
									<Typography component="h2" variant="h6">Account details</Typography>
									<Button onClick={() => setIsEditing(true)}>Edit</Button>
								</Stack>
								<Box>
									<Typography variant="body2" color="text.secondary">Email</Typography>
									<Typography sx={{ overflowWrap: 'anywhere' }}>{user.email}</Typography>
								</Box>
								<Box>
									<Typography variant="body2" color="text.secondary">Username</Typography>
									<Typography>{user.username || 'Not set'}</Typography>
								</Box>
							</Stack>
						)}
					</Box>
				)}
				<Dialog open={isPrivacySettingsOpen} onClose={() => setIsPrivacySettingsOpen(false)}>
					<DialogTitle>Profile settings</DialogTitle>
					<DialogContent>
						<Stack spacing={1} sx={{ pt: 1 }}>
							<FormControlLabel
								control={
									<Switch
										checked={user?.is_public ?? true}
										disabled={!user || isPrivacySaving}
										onChange={(event) => void handlePrivacyChange(event.target.checked)}
									/>
								}
								label={user?.is_public ? 'Public account' : 'Private account'}
							/>
							<Typography variant="body2" color="text.secondary">
								Choose whether your account is public or private.
							</Typography>
							{privacyError && <Alert severity="error">{privacyError}</Alert>}
						</Stack>
					</DialogContent>
					<DialogActions sx={{ justifyContent: 'space-between' }}>
						<Button color="error" startIcon={<LogoutOutlinedIcon />} onClick={handleLogout}>
							Log out
						</Button>
						<Button onClick={() => setIsPrivacySettingsOpen(false)}>Close</Button>
					</DialogActions>
				</Dialog>
			</Stack>
		</Box>
	)
}