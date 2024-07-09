
import { withStyles, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (theme: Theme): TagStyles => ({
    root: {
        padding: `${theme.mySpacing.y.large} ${theme.mySpacing.y.large} 0 ${theme.mySpacing.y.large}`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
        backgroundSize: '100% 20px',
        backgroundImage: theme.palette.paperGradient,
        position: 'relative',
    },
    'bg-none': {
        background: 'none',
    },
    'justify': {
        justifyContent: 'space-between',
    },
})

type PaperWrapperProps = {
    classes?: any
    className?: string
    children: React.ReactNode

}
const PaperWrapper = ({ classes = {}, className = '', children }: PaperWrapperProps) => (
    <div
        className={`${classes.root} ${classes[className] || className}`}
    >
        {children}
    </div>
)

export default withStyles(styles)(PaperWrapper)