
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
    pullRequests
        .forEach((prData:PullRequest) => {
            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1
        })

    const chunkyData = chunkData(pullRequests)

    return <>
        <ReportDescription />
        <TeamTrends
            pullRequests={pullRequests}
            chunkyData={chunkyData}
            allRepos={allRepos}
        />
        <CustomGraphs
            pullRequests={pullRequests}
            chunkyData={chunkyData}
            tableOpenedByDefault={true}
        />
        <PullRequestTrends
            pullRequests={pullRequests}
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
