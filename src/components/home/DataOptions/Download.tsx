
import { connect } from 'react-redux'
import {
    getDownloadProps,
} from '../../../state/actions'
import { PullRequest } from '../../../types/FormattedData'
import { AnyForLib } from '../../../types/State'

type Download = {
    fetching: boolean,
    pullRequests: PullRequest[],
    getDownloadInfo: () => object,
}
const Download = ({
    fetching,
    pullRequests,
    getDownloadInfo,
}: Download) => {
    const info = getDownloadInfo()
    return !fetching && pullRequests.length > 0
        ? <p><a className="text-primary" {...info}>Download report data</a></p>
        : null
}

type State = {
    fetching: boolean,
    pullRequests: PullRequest[],
}
const mapStateToProps = (state: State) => ({
    fetching: state.fetching,
    pullRequests: state.pullRequests,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps, mapDispatchToProps)(Download)
