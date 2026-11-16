import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export function AboutPage() {
	return (
		<Box
			component="main"
			sx={{
				width: '100%',
				maxWidth: 1040,
				mx: 'auto',
				px: { xs: 2, sm: 3 },
				py: { xs: 4, md: 6 },
				'& .about-reveal': { animation: 'about-rise 480ms ease-out both' },
				'@keyframes about-rise': {
					from: { opacity: 0, transform: 'translateY(12px)' },
					to: { opacity: 1, transform: 'translateY(0)' },
				},
				'@media (prefers-reduced-motion: reduce)': {
					'& .about-reveal': { animation: 'none' },
				},
			}}
		>
			<Stack spacing={{ xs: 4, md: 6 }}>
				<Box
					component="header"
					className="about-reveal"
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)' },
						alignItems: 'end',
						gap: { xs: 2, md: 5 },
						pb: { xs: 3, md: 4 },
						borderBottom: 1,
						borderColor: 'divider',
					}}
				>
					<Stack spacing={1.5}>
						<Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
							MEMOSPHERE / ABOUT
						</Typography>
						<Typography
							component="h1"
							variant="h3"
							sx={{
								maxWidth: 620,
								fontWeight: 600,
								lineHeight: 1.12,
								color: 'text.primary',
							}}
						>
							Ideas have room to grow here.
						</Typography>
					</Stack>
					<Typography
						variant="subtitle1"
						sx={{ borderLeft: 3, borderColor: 'secondary.main', pl: 2, py: 0.5 }}
					>
						A social space for keeping thoughts, sharing stories, and finding perspectives worth remembering.
					</Typography>
				</Box>

				<Box component="section" aria-labelledby="about-ways-to-connect">
					<Stack spacing={0.75} sx={{ mb: 2.5 }}>
						<Typography component="h2" variant="h5" id="about-ways-to-connect">
							Write. Discover. Connect.
						</Typography>
						<Typography color="text.secondary">
							Built around your words, and the people you choose to share them with.
						</Typography>
					</Stack>
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
						<Card className="about-reveal" variant="outlined" sx={{ borderTop: 3, borderTopColor: 'primary.main', borderRadius: 1 }}>
							<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
								<EditNoteOutlinedIcon sx={{ color: 'primary.main', fontSize: 30, mb: 1 }} />
								<Typography component="h3" variant="h6" sx={{ mb: 0.75 }}>Keep your thoughts</Typography>
								<Typography variant="body2" color="text.secondary">
									Write posts that capture an idea, a moment, or a story you want to remember.
								</Typography>
							</CardContent>
						</Card>
						<Card className="about-reveal" variant="outlined" sx={{ borderTop: 3, borderTopColor: 'secondary.main', borderRadius: 1, animationDelay: '80ms' }}>
							<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
								<ExploreOutlinedIcon sx={{ color: 'secondary.main', fontSize: 30, mb: 1 }} />
								<Typography component="h3" variant="h6" sx={{ mb: 0.75 }}>Find a new perspective</Typography>
								<Typography variant="body2" color="text.secondary">
									Explore categories and discover writing from across the community.
								</Typography>
							</CardContent>
						</Card>
						<Card className="about-reveal" variant="outlined" sx={{ borderTop: 3, borderTopColor: 'success.main', borderRadius: 1, animationDelay: '160ms' }}>
							<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
								<PeopleAltOutlinedIcon sx={{ color: 'success.main', fontSize: 30, mb: 1 }} />
								<Typography component="h3" variant="h6" sx={{ mb: 0.75 }}>Build your circle</Typography>
								<Typography variant="body2" color="text.secondary">
									Follow writers whose ideas you want to keep up with.
								</Typography>
							</CardContent>
						</Card>
					</Box>
				</Box>

				<Box component="section" aria-labelledby="about-privacy" sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
					<Stack spacing={2}>
						<Box>
							<Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
								YOUR SPACE, YOUR AUDIENCE
							</Typography>
							<Typography component="h2" variant="h5" id="about-privacy">
								Choose how far each thought travels.
							</Typography>
						</Box>
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
							<Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
								<PublicOutlinedIcon color="primary" />
								<Box>
									<Typography variant="subtitle2">Public</Typography>
									<Typography variant="body2" color="text.secondary">Open to everyone.</Typography>
								</Box>
							</Stack>
							<Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
								<PeopleAltOutlinedIcon color="secondary" />
								<Box>
									<Typography variant="subtitle2">Followers</Typography>
									<Typography variant="body2" color="text.secondary">For people who follow you.</Typography>
								</Box>
							</Stack>
							<Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
								<LockOutlinedIcon color="success" />
								<Box>
									<Typography variant="subtitle2">Private</Typography>
									<Typography variant="body2" color="text.secondary">Just for you.</Typography>
								</Box>
							</Stack>
						</Box>
						<Button component={Link} to="/all_posts" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
							Browse posts
						</Button>
					</Stack>
				</Box>
			</Stack>
		</Box>
	)
}