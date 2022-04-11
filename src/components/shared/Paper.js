import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'


const styles = theme => ({
    root: {
        padding: `${theme.mySpacing.y.large} ${theme.mySpacing.y.large} 0 ${theme.mySpacing.y.large}`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
        backgroundSize: '100% 20px',
        backgroundImage: `linear-gradient(${theme.palette.shadow}, rgba(0,0,0,0))`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    'bg-none': {
        background: 'none'
    },
    'justify': {
        justifyContent: 'space-between',
    },
})

const PaperWapper = ({ classes = {}, className = '', children } = {}) => (
    <div
        className={classNames(classes.root, classes[className] || className)}
    >
        {children}
    </div>
)

export default withStyles(styles)(PaperWapper)