import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress';
import { H } from './shared/StyledTags'

const styles = theme => ({
    'root': {
        position: 'relative',
    },
    'modal': {
        position: 'fixed',
        width: '80%',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: theme.palette.background.paper,
        padding: `${theme.mySpacing.x.large} ${theme.mySpacing.y.large}`,
        '& .MuiLinearProgress-dashed': {
            background: 'none',
            backgroundColor: '#b10e4f',
            animation: 'none',
        },
        '& .MuiLinearProgress-root': {
            height: '14px',
            marginBottom: theme.mySpacing.y.large,
        }
    },
    'overlay': {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 999,
        backgroundColor: '#b10e4f',
        animation: 'pulse 1s infinite alternate',
        opacity: 0.6,
    },
    '@keyframes pulse': {
        '100%': {
            opacity: 0.9,
        },
    }
})

const Loader = ({
    fetching,
    fetchStatus = {},
    classes
} = {}) => {
    const {
        page = 1,
        pagesLoaded = 0,
        pagesRemaining = 0,
        pullRequests = 0,
        issues = 0,
        releases = 0,
    } = fetchStatus

    const pagesTotal = pagesLoaded + pagesRemaining
    const onePagePercent = 100 / (pagesTotal || 10)
    const loadedPercent = (pagesLoaded * onePagePercent)

    return (
        fetching && <div>
            <div className={ classes.overlay }></div>
            <div className={ classes.modal }>
                <H level={2}>
                    {page} {pagesTotal ? `of ${pagesTotal}` : ''}
                </H>
                <LinearProgress className={classes.dashed} variant="determinate" value={loadedPercent} valueBuffer={onePagePercent + loadedPercent}/>

                <H level={2}>
                    {pullRequests} Pull Requests
                </H>
                <H level={2}>
                    {issues} Issues
                </H>
                <H level={2}>
                    {releases} Releases
                </H>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    fetchStatus: state.fetchStatus,
})

export default connect(mapStateToProps)(withStyles(styles)(Loader))
