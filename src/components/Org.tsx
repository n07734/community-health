
import { connect } from 'react-redux'
import { PullRequest } from '../types/FormattedData'

import CustomGraphs from './sections/CustomGraphs'
import TeamTrends from './sections/TeamTrends'
import ReportDescription from './sections/ReportDescription'
import PullRequestTrends from './sections/PullRequestTrends'

import { chunkData } from './charts/lineHelpers'

type OrgProps = {
    pullRequests: PullRequest[]
}
const Org = ({
    pullRequests = [],
}: OrgProps) => {

    const allRepos:Record<string, number> = {}
    const updatedPullRequests:PullRequest[] = pullRequests
        .map((prData:PullRequest, i) => {
            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1

            return {
                ...prData,
                id: `${i}-${prData.repo}-${prData.number}`,
                [`repo-${prData.repo}`]: 1,
                commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0),
            }
        })

    const chunkyData = chunkData(updatedPullRequests)

    return <>
        <ReportDescription />
        <TeamTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            allRepos={allRepos}
        />
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
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
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(Org)
