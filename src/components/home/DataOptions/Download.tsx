
import { connect } from 'react-redux'
import {
    getDownloadProps,
} from '../../../state/actions'
import { PullRequest } from '../../../types/FormattedData'
import { AnyForLib } from '../../../types/State'

type Download = {
    fetching: boolean,
    preFetchedName?: string,
    pullRequests: PullRequest[],
    getDownloadInfo: () => object,
}
const Download = ({
    fetching,
    preFetchedName,
    pullRequests,
    getDownloadInfo,
}: Download) => {
    const info = getDownloadInfo()
    return !fetching && !preFetchedName && pullRequests.length > 0
        ? <p><a className="text-primary" {...info}>Download report data</a></p>
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

export default connect(mapStateToProps, mapDispatchToProps)(Download)
