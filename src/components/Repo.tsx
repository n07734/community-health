import PullRequestTrends from './sections/PullRequestTrends'
import CustomGraphs from './sections/CustomGraphs'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import Sentiment from './sections/Sentiment'
import UserTrends from './sections/UserTrends'
import UserList from './sections/UserList'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'
import { useDataStore } from '@/state/fetch'

const RepoView = () => {
    const pullRequests = useDataStore(state => state.pullRequests)
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

export default RepoView
