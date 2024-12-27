
import { connect } from 'react-redux'

import PullRequestTrends from './sections/PullRequestTrends'
import CustomGraphs from './sections/CustomGraphs'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import Sentiment from './sections/Sentiment'
import UserTrends from './sections/UserTrends'
import UserList from './sections/UserList'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'
import { PullRequest } from '../types/FormattedData'

type RepoViewProps = {
    pullRequests: PullRequest[]
}
const RepoView = ({
    pullRequests = [],
}: RepoViewProps) => {
    const chunkyData = chunkData(pullRequests)

    return <>
        <ReportDescription />
        <TeamTrends
            pullRequests={pullRequests}
            chunkyData={chunkyData}
        />
        <CustomGraphs
            pullRequests={pullRequests}
            chunkyData={chunkyData}
            tableOpenedByDefault={true}
        />
        <Sentiment
            pullRequests={pullRequests}
            chunkyData={chunkyData}
        />
        <PullRequestTrends
            pullRequests={pullRequests}
            chunkyData={chunkyData}
        />
        <IssuesTrends />
        <UserTrends />
        <UserList />
    </>
}

type State = {
    pullRequests: PullRequest[]
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(RepoView)
