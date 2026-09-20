import { useState, type SyntheticEvent } from 'react'
import { Box, Button, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login')
    const navigate = useNavigate();
    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        navigate('/home')
    }

    return (
        <Box component="main" sx={{ maxWidth: 420, mx: 'auto', p: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
                Memosphere
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                {mode === 'login' ? 'Log in to your account' : 'Create your account'}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                <Tabs
                    value={mode}
                    onChange={(_, value: AuthMode) => setMode(value)}
                    variant="fullWidth"
                >
                    <Tab value="login" label="Login" />
                    <Tab value="signup" label="Sign up" />
                </Tabs>
                <TextField label="Email" type="email" required fullWidth />
                <TextField label="Password" type="password" required fullWidth slotProps={{ htmlInput: { minLength: 8 } }} />
                <Button type="submit" variant="contained" fullWidth>
                    {mode === 'login' ? 'Log in' : 'Create account'}
                </Button>
                </Stack>
            </Box>
        </Box>
    )
}
