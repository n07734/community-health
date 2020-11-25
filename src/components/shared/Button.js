import React from 'react'
import {
    Button as CoreButton,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const Button = ({
    className,
    classes,
    onClick,
    key,
    value,
    type = 'submit',
    color = 'inherit',
} = {}) => (
    <CoreButton
        className={[classes.root, (className || '')].join(' ')}
        variant="contained"
        size="small"
        type={type}
        color={color}
        value={value}
        key={key}
        onClick={onClick}
    >
        {value}
    </CoreButton>
)

const styles = theme => ({
    root: {
        marginRight: theme.spacing.x.small,
        marginBottom: theme.spacing.y.small,
    },
})
export default withStyles(styles)(Button)