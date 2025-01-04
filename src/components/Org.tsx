
import { PullRequest } from '../types/FormattedData'

import CustomGraphs from './sections/CustomGraphs'
import TeamTrends from './sections/TeamTrends'
import ReportDescription from './sections/ReportDescription'
import PullRequestTrends from './sections/PullRequestTrends'

import { chunkData } from './charts/lineHelpers'
import { useDataStore } from '@/state/fetch'

const Org = () => {
    const pullRequests = useDataStore(state => state.pullRequests)

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

export default Org
