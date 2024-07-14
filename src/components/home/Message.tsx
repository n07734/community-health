
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { P } from '../shared/StyledTags'

const variant = {
    'warn': <WarningIcon />,
    'error': <ErrorIcon />,
}

export type ErrorInputs = {
    level?: 'warn' | 'error'
    message: string
}

type MessageProps = {
    error: ErrorInputs
    classes: Record<string, string>
    className?: string
}
const Message = ({
    error: {
        level = 'error',
        message,
    },
    classes,
    className,
}: MessageProps) => (
    <div className={`${classes[level]} ${classes.root} ${className}`} >
        {variant[level]}
        <P className={classes.copy}>{message}</P>
    </div>
)

const styles = (theme: Theme) => ({
    root: {
        padding: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        '& .MuiSvgIcon-root': {
            color: theme.palette.text.primary,
        },
    },
    copy: {
        margin: 0,
        marginLeft: theme.mySpacing.y.medium,
        padding: 0,
        color: theme.palette.text.primary,
    },
    error: {
        backgroundColor: theme.palette.error.main,
    },
    warn: {
        backgroundColor: theme.palette.warn.main,
    },
})
export default withStyles(styles)(Message)