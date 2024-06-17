
import { withStyles } from '@mui/styles'

const styles = theme => ({
    root: {
        padding: `${theme.mySpacing.y.large} ${theme.mySpacing.y.large} 0 ${theme.mySpacing.y.large}`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
        backgroundSize: '100% 20px',
        backgroundImage: `linear-gradient(${theme.palette.shadow}, rgba(0,0,0,0))`,
        position: 'relative',
    },
    'bg-none': {
        background: 'none',
    },
    'justify': {
        justifyContent: 'space-between',
    },
})

const PaperWapper = ({ classes = {}, className = '', children } = {}) => (
    <div
        className={`${classes.root} ${classes[className] || className}`}
    >
        {children}
    </div>
)

export default withStyles(styles)(PaperWapper)