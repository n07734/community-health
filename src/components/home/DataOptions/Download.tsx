
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import styles from './styles'
import {
    getDownloadProps,
} from '../../../state/actions'
import { P } from '../../shared/StyledTags'

type Download = {
    fetching: boolean,
    preFetchedName?: string,
    pullRequests: any[],
    classes: any,
    getDownloadInfo: () => object,
}
const Download = ({
    fetching,
    preFetchedName,
    pullRequests,
    classes,
    getDownloadInfo,
}: Download) => {
    const info = getDownloadInfo()
    return !fetching && !preFetchedName && pullRequests.length > 0
        ? <P><a className={classes.link} {...info}>Download report data</a></P>
        : null
}

type State = {
    fetching: boolean,
    pullRequests: any[],
    preFetchedName: string,
}
const mapStateToProps = (state: State) => ({
    fetching: state.fetching,
    pullRequests: state.pullRequests,
    preFetchedName: state.preFetchedName,
})

const mapDispatchToProps = (dispatch: any) => ({
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Download))
