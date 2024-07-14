
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

const CoreWrapper = ({ classes, children }: { classes: Record<string, string>, children:React.ReactNode }) => <div className={classes.wrapper}>{children}</div>

const styles = (theme:Theme) => ({
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