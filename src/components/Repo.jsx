
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

const RepoView = ({ pullRequests = [], releases = [] } = {}) => {
    const updatedPullRequests = pullRequests
        .map((prData = {}, i) => ({
            ...prData,
            id: `${i}-${prData.repo}-${prData.number}`,
            commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0),
            [`${prData.author}-commentsSentimentScore`]: prData.commentSentimentScore,
            [`${prData.author}-commentAuthorSentimentScore`]: prData.commentAuthorSentimentScore,
        }))

    const chunkyData = chunkData(updatedPullRequests)

    return <>
        <ReportDescription />
        <TeamTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            releases={releases}
        />
        <Sentiment
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <PullRequestTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <IssuesTrends />
        <UserTrends />
        <UserList />
    </>
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
})

export default connect(mapStateToProps)(RepoView)
