import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import homeBackground from '../assets/Background_1.jpg'

export function Home() {
    const navigate = useNavigate()

    return (
        <Box
            component="main"
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'grid',
                placeItems: 'center',
                px: { xs: 3, sm: 6 },
                py: 8,
                textAlign: 'center',
                position: 'relative',
                backgroundColor: 'background.default',
                backgroundImage: `url("${homeBackground}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <Stack spacing={4} alignItems="center" sx={{ maxWidth: 640 }}>
                <Typography
                    variant="overline"
                    sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em' }}
                >
                    A space for thoughts and stories
                </Typography>
                <Typography
                    component="h1"
                    variant="h1"
                    sx={{
                        color: 'text.primary',
                        fontSize: { xs: '2.75rem', sm: '3.5rem' },
                        fontWeight: 500,
                        lineHeight: 1.16,
                    }}
                >
                    Welcome to
                    <Box component="span" sx={{ display: 'block', color: 'primary.main', fontStyle: 'italic' }}>
                        Memosphere
                    </Box>
                </Typography>
                <Typography
                    color="text.secondary"
                    variant="h6"
                    sx={{ maxWidth: 480, fontWeight: 400, lineHeight: 1.55 }}
                >
                    Find something worth remembering.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/all_posts')}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 6,
                        boxShadow: 4,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': { boxShadow: 7 },
                    }}
                >
                    Explore your feed
                </Button>
            </Stack>
        </Box>
    )
}