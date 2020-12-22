import React from 'react'
import { Switch } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const ThemeSwitch = ({ classes, onChange } = {}) => (
    <>
        <Switch
            classes={classes}
            onChange={onChange}
        />
    </>
)

const styles = theme => ({
    root: {
        color: theme.typography.body1.color,
        position: 'absolute',
        top: '0.2rem',
        right: 0,
        '& span': {
            color: theme.palette.switch,
        },
        '& $bar': {
            backgroundColor: '#666',
        },
        '& $checked + $bar': {
            backgroundColor: '#999',
        },
    },
    checked: {},
    bar: {},
})

export default withStyles(styles)(ThemeSwitch)