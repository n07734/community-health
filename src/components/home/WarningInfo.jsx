
import { SnackbarContent } from '@mui/material'
import { Warning } from '@mui/icons-material'

import amber from '@mui/material/colors/amber'
import { withStyles } from '@mui/styles'

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