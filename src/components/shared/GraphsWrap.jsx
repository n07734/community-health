
import { withStyles } from '@mui/styles'

const styles = () => ({
    root: {
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: 0,
        alignItems: 'center',
        '@media (min-width: 2400px)': {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '0 20px',
            justifyContent: 'center',
        },
    },
})

const GraphsWrap = ({ classes = {}, children } = {}) => (
    <div
        className={classes.root}
    >
        {children}
    </div>
)

export default withStyles(styles)(GraphsWrap)