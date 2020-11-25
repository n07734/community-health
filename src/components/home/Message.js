import React from 'react'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import { withStyles } from '@material-ui/core/styles'

import { P } from '../shared/StyledTags'

const variant = {
    'warning': <WarningIcon />,
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
    },
    copy: {
        margin: 0,
        marginLeft: theme.spacing.y.medium,
        padding: 0,
        color: '#000',
    },
    error: {
        backgroundColor: '#e02e2e',
    },
    warning: {
        backgroundColor: '#dc7e09',
    },
})
export default withStyles(styles)(Message)