import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const CoreWrapper = ({ classes, children }) => <div className={classes.wrapper}>{children}</div>

const styles = theme => ({
    '@global': {
        'body': {
            margin: 0,
            backgroundColor: theme.palette.background.default,
        },
    },
    wrapper: {
        padding: 0,
        backgroundColor: theme.palette.background.default,
        overflow: 'auto',
    },
})

export default withStyles(styles)(CoreWrapper)