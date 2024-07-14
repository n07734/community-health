
import { connect } from 'react-redux'
import { EventInfo, PullRequest } from '../types/FormattedData'
import { ObjNumbers } from '../types/Components'

import CustomGraphs from './sections/CustomGraphs'
import TeamTrends from './sections/TeamTrends'
import ReportDescription from './sections/ReportDescription'
import PullRequestTrends from './sections/PullRequestTrends'

import { chunkData } from './charts/lineHelpers'
import { formatMarkers } from '../format/releaseData'

type OrgProps = {
    pullRequests: PullRequest[]
    events: EventInfo[]
}
const Org = ({
    pullRequests = [],
    events = [],
}: OrgProps) => {

    const allRepos: ObjNumbers = {}
    const updatedPullRequests:PullRequest[] = pullRequests
        .map((prData:PullRequest = {} as PullRequest, i) => {
            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1

            return {
                ...prData,
                id: `${i}-${prData.repo}-${prData.number}`,
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
            tableOpenedByDefault={true}
        />
        <PullRequestTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />

    </>
}

type State = {
    pullRequests: PullRequest[]
    fetches: {
        events: EventInfo[]
    }
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    events: state.fetches.events,
})

export default connect(mapStateToProps)(Org)
