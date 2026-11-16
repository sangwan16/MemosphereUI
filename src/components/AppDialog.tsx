import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { AlertColor } from '@mui/material'
import type { ReactNode } from 'react'

type AppDialogProps = {
	open: boolean
	title: string
	message: ReactNode
	severity?: AlertColor
	onClose: () => void
	onConfirm?: () => void
	confirmLabel?: string
	cancelLabel?: string
	isBusy?: boolean
}

export function AppDialog({
	open,
	title,
	message,
	severity = 'info',
	onClose,
	onConfirm,
	confirmLabel = 'Confirm',
	cancelLabel,
	isBusy = false,
}: AppDialogProps) {
	const hasConfirmAction = onConfirm !== undefined

	return (
		<Dialog
			open={open}
			onClose={isBusy ? undefined : onClose}
			aria-labelledby="app-dialog-title"
			fullWidth
			maxWidth="xs"
		>
			<DialogTitle id="app-dialog-title">{title}</DialogTitle>
			<DialogContent>
				<Alert severity={severity}>{message}</Alert>
			</DialogContent>
			<DialogActions>
				<Button disabled={isBusy} onClick={onClose}>
					{cancelLabel ?? (hasConfirmAction ? 'Cancel' : 'Close')}
				</Button>
				{hasConfirmAction && (
					<Button
						variant="contained"
						color={severity === 'error' ? 'error' : 'primary'}
						disabled={isBusy}
						onClick={onConfirm}
					>
						{isBusy ? 'Please wait...' : confirmLabel}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	)
}