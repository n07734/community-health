
import {
    Button as CoreButton,
} from '@mui/material'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

type ButtonProps = {
    className?: string
    classes: Record<string, string>
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
    key?: string
    value: string
    text?: string
    type?: 'button' | 'submit' | 'reset'
    color?: 'primary' | 'secondary'
    disabled?: boolean
}
const Button = ({
    className,
    classes,
    onClick,
    key,
    value,
    text,
    type = 'submit',
    color = 'primary',
    disabled = false,
}: ButtonProps) => (
    <CoreButton
        className={[classes.root, (className || '')].join(' ')}
        variant="contained"
        size="small"
        type={type}
        color={color}
        value={value}
        key={key}
        onClick={onClick}
        disabled={disabled}
    >
        {text || value}
    </CoreButton>
)

const styles = (theme: Theme) => ({
    root: {
        marginRight: theme.mySpacing.x.small,
        marginBottom: theme.mySpacing.y.small,
    },
})
export default withStyles(styles)(Button)