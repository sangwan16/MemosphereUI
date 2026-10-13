import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

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
            }}
        >
            <Stack spacing={3} alignItems="center" sx={{ maxWidth: 560 }}>
                <Typography component="h1" variant="h2">
                    Welcome to Memosphere
                </Typography>
                <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 400 }}>
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