import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listNotifications, respondToFollowRequest, type NotificationItem } from '../api/posts'

function formatNotificationDate(value: string) {
	return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function NotificationsPage() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [loadError, setLoadError] = useState(false)
	const [actionError, setActionError] = useState('')
	const [activeRequestId, setActiveRequestId] = useState<number | null>(null)
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isActive = true
		setIsLoading(true)
		setLoadError(false)
		listNotifications()
			.then((loadedNotifications) => {
				if (isActive) setNotifications(loadedNotifications)
			})
			.catch(() => {
				if (isActive) setLoadError(true)
			})
			.finally(() => {
				if (isActive) setIsLoading(false)
			})

		return () => {
			isActive = false
		}
	}, [reloadKey])

	async function handleRequest(notificationId: number, response: 'accept' | 'decline') {
		if (activeRequestId !== null) return
		setActiveRequestId(notificationId)
		setActionError('')
		try {
			const updatedNotification = await respondToFollowRequest(notificationId, response)
			setNotifications((current) => current.map((notification) =>
				notification.id === updatedNotification.id ? updatedNotification : notification,
			))
			window.dispatchEvent(new Event('notifications-updated'))
		} catch {
			setActionError(`The follow request could not be ${response === 'accept' ? 'accepted' : 'declined'}. Please try again.`)
		} finally {
			setActiveRequestId(null)
		}
	}

	return (
		<Box component="main" sx={{ width: '100%', maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
			<Stack spacing={2}>
				{/* <Typography component="h1" variant="h4">Notifications</Typography> */}
				{actionError && <Alert severity="error">{actionError}</Alert>}
				{isLoading && <CircularProgress aria-label="Loading notifications" />}
				{!isLoading && loadError && (
					<Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setReloadKey((key) => key + 1)}>Retry</Button>}>
						Notifications could not be loaded.
					</Alert>
				)}
				{!isLoading && !loadError && notifications.length === 0 && (
					<Typography color="text.secondary">You have no notifications yet.</Typography>
				)}
				{!isLoading && !loadError && notifications.map((notification) => (
					<Card key={notification.id} variant="outlined" sx={{ borderRadius: 1 }}>
						<CardContent sx={{ '&:last-child': { pb: 2 } }}>
							<Stack spacing={1.5}>
								<Box sx={{ minWidth: 0 }}>
										<Typography sx={{ overflowWrap: 'anywhere' }}>{notification.message}</Typography>
										<Typography component="time" dateTime={notification.created_at} variant="caption" color="text.secondary">
											{formatNotificationDate(notification.created_at)}
										</Typography>
									</Box>
								{notification.type === 'follow_request' && notification.actor_id !== null && (
									<Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
										<Button component={Link} to={`/users/${notification.actor_id}`} size="small">View profile</Button>
										<Button
											variant="contained"
											size="small"
											disabled={activeRequestId !== null}
											onClick={() => void handleRequest(notification.id, 'accept')}
										>
											{activeRequestId === notification.id ? 'Saving...' : 'Accept'}
										</Button>
										<Button
											size="small"
											disabled={activeRequestId !== null}
											onClick={() => void handleRequest(notification.id, 'decline')}
										>
											Decline
										</Button>
									</Stack>
								)}
							</Stack>
						</CardContent>
					</Card>
				))}
			</Stack>
		</Box>
	)
}
