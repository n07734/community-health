
import { connect } from 'react-redux'

import CustomGraphs from './sections/CustomGraphs'
import TeamTrends from './sections/TeamTrends'
import ReportDescription from './sections/ReportDescription'
import PullRequestTrends from './sections/PullRequestTrends'

import { chunkData } from './charts/lineHelpers'
import { formatMarkers } from '../format/releaseData'

const Org = ({
    pullRequests = [],
    events = [],
} = {}) => {

    const allRepos = {}
    const updatedPullRequests = pullRequests
        .map((prData = {}) => {
            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1
            return {
                ...prData,
                [`repo-${prData.repo}`]: 1,
                commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0),
            }
        })

    const chunkyData = chunkData(updatedPullRequests)
    const markers = formatMarkers({ events })

    return <>
        <ReportDescription />
        <TeamTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            releases={markers}
            allRepos={allRepos}
        />
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            releases={markers}
        />
        <PullRequestTrends
            chunkyData={chunkyData}
        />

    </>
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    events: state.fetches.events,
})

export default connect(mapStateToProps)(Org)
