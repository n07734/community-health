import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import styles from './styles'
import {
    getDownloadProps,
} from '../../../state/actions'
import { P } from '../../shared/StyledTags'

const Download = ({
    fetching,
    preFetchedName,
    pullRequests,
    classes,
    getDownloadInfo,
} = {}) =>
    !fetching && !preFetchedName && pullRequests.length > 0
        ? <P><a className={classes.link} {...getDownloadInfo()}>Download report data</a></P>
        : null

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    pullRequests: state.pullRequests,
})

const mapDispatchToProps = dispatch => ({
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Download))
