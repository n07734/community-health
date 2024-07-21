
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import styles from './styles'
import {
    getDownloadProps,
} from '../../../state/actions'
import { P } from '../../shared/StyledTags'
import { PullRequest } from '../../../types/FormattedData'
import { AnyForLib } from '../../../types/State'

type Download = {
    fetching: boolean,
    preFetchedName?: string,
    pullRequests: PullRequest[],
    classes: Record<string, string>,
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
    pullRequests: PullRequest[],
    preFetchedName: string,
}
const mapStateToProps = (state: State) => ({
    fetching: state.fetching,
    pullRequests: state.pullRequests,
    preFetchedName: state.preFetchedName,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Download))
