
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import { withStyles } from '@mui/styles'

import { P } from '../shared/StyledTags'

const variant = {
    'warn': <WarningIcon />,
    'error': <ErrorIcon />,
}

const Message = ({
    error: {
        level,
        message,
    },
    classes,
    className,
} = {}) => (
    <div className={`${classes[level]} ${classes.root} ${className}`} >
        {variant[level]}
        <P className={classes.copy}>{message}</P>
    </div>
)

const styles = theme => ({
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