import { Alert, Box, Button, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { login, resendVerification, signup, verifyEmail } from '../api/auth'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [canResend, setCanResend] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const verificationToken = searchParams.get('verification_token')

    useEffect(() => {
        if (!verificationToken) return

        let isActive = true
        setIsVerifying(true)
        verifyEmail(verificationToken)
            .then(() => {
                if (isActive) navigate('/home', { replace: true })
            })
            .catch(() => {
                if (!isActive) return
                setCanResend(true)
                setError('This verification link is invalid, expired, or already used. You can request another.')
            })
            .finally(() => {
                if (!isActive) return
                setIsVerifying(false)
                const nextParams = new URLSearchParams(searchParams)
                nextParams.delete('verification_token')
                setSearchParams(nextParams, { replace: true })
            })

        return () => {
            isActive = false
        }
    }, [navigate, searchParams, setSearchParams, verificationToken])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setNotice('')
        setIsSubmitting(true)

        try {
            if (mode === 'signup') {
                await signup(email.trim(), password, username.trim())
                setCanResend(true)
                setNotice('Account created. Check your email for a verification link before logging in.')
            } else {
                await login(email.trim(), password)
                navigate('/home', { replace: true })
            }
        } catch (requestError) {
            const detail = axios.isAxiosError<{ detail?: string }>(requestError)
                ? requestError.response?.data?.detail
                : undefined
            setError(detail || (mode === 'signup' ? 'Could not create your account.' : 'Could not log in. Check your email and password.'))
            if (mode === 'signup' && axios.isAxiosError(requestError) && requestError.response?.status === 503) {
                setCanResend(true)
            }
            if (mode === 'login' && axios.isAxiosError(requestError) && requestError.response?.status === 403) {
                setCanResend(true)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleResendVerification() {
        if (!email.trim()) {
            setError('Enter your email address to request a new verification link.')
            return
        }

        setError('')
        setNotice('')
        setIsSubmitting(true)
        try {
            const response = await resendVerification(email.trim())
            setNotice(response.message)
        } catch {
            setError('Could not request a new verification email. Try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box component="main" sx={{ maxWidth: 420, mx: 'auto', p: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
                Memosphere
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                {mode === 'login' ? 'Log in to your account' : 'Create your account'}
            </Typography>

            {isVerifying && <Alert severity="info" sx={{ mb: 2 }}>Verifying your email...</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

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
                <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth autoComplete="email" />
                {mode === 'signup' && (
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
                )}
                <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required fullWidth autoComplete={mode === 'login' ? 'current-password' : 'new-password'} slotProps={{ htmlInput: { minLength: 8, maxLength: 128 } }} />
                <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || isVerifying}>
                    {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
                </Button>
                {canResend && (
                    <Button type="button" onClick={handleResendVerification} disabled={isSubmitting}>
                        Resend verification email
                    </Button>
                )}
                </Stack>
            </Box>
        </Box>
    )
}
