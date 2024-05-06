
import { SnackbarContent } from '@material-ui/core'
import { Warning } from '@material-ui/icons'

import amber from '@material-ui/core/colors/amber'
import { withStyles } from '@material-ui/core/styles'

const infoStyles = theme => ({
    warning: {
        backgroundColor: amber[700],
        marginBottom: theme.mySpacing.x.meduim,
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.mySpacing.y.medium,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
})

const WarningRaw = ({ classes = {}, className = '' } = {}) => (<>
    <SnackbarContent
        className={`${classes.warning} ${className}`}
        message={
            <span className={classes.message}>
                <Warning className={`${classes.icon} ${classes.iconVariant}`} />Warning using demo data, fill in form to get real data from gitHub
            </span>
        }
    />
</>)

export default withStyles(infoStyles)(WarningRaw)