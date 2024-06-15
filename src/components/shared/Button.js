
import {
    Button as CoreButton,
} from '@mui/material'
import { withStyles } from '@mui/styles'

const Button = ({
    className,
    classes,
    onClick,
    key,
    value,
    text,
    type = 'submit',
    color = 'primary',
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
        {text || value}
    </CoreButton>
)

const styles = theme => ({
    root: {
        marginRight: theme.mySpacing.x.small,
        marginBottom: theme.mySpacing.y.small,
    },
})
export default withStyles(styles)(Button)