import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import RepoView from '../repo/Repo'
import UserView from '../user/User'

const styles = () => ({
    'root': {
        position: 'relative',
    },
    'fetching': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#b10e4f',
        animation: 'pulse 1s infinite alternate',
        opacity: 0.4,
    },
    '@keyframes pulse': {
        '100%': {
            opacity: 0.6,
        },
    },
})

const Visualisation = ({
    user,
    fetching,
    classes,
} = {}) => (
    <div className={classes.root}>
        {
            user
                ? <UserView />
                : <RepoView />
        }
        {
            fetching
                && <div className={classes.fetching}></div>
        }
    </div>
)

const mapStateToProps = (state) => ({
    user: state.user,
    fetching: state.fetching,

})

export default connect(mapStateToProps)(withStyles(styles)(Visualisation))