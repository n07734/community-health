
import { connect } from 'react-redux'

import PullRequestTrendsTeam from './sections/PullRequestTrendsTeam'
import CustomGraphs from './sections/CustomGraphs'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'
import { PullRequest } from '../types/FormattedData'
import { FetchInfo } from '../types/State'

type TeamProps = {
    pullRequests: PullRequest[]
    userIds: string[]
}
const Team = ({
    pullRequests = [],
    userIds = [],
}:TeamProps) => {
    const teamOnlyData = (data:Record<string, number>) => {
        const teamData:Record<string, number> = {}
        userIds
            .forEach(userId => {
                const usersData = data?.[userId]
                if (usersData) {
                    teamData[userId] = usersData
                }
            })

        return teamData
    }

    const allRepos:Record<string, number> = {}
    const updatedPullRequests:PullRequest[] = pullRequests
        .map((prData, i) => {
            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1
            return {
                ...prData,
                id: `${i}-${prData.repo}-${prData.number}`,
                teamApprovers: teamOnlyData(prData.approvers),
                teamCommenters: teamOnlyData(prData.commenters),
                [`repo-${prData.repo}`]: 1,
                commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0),
                [`${prData.author}-commentsSentimentScore`]: prData.commentSentimentScore,
                [`${prData.author}-commentAuthorSentimentScore`]: prData.commentAuthorSentimentScore,
            }
        })

    const chunkyData = chunkData(updatedPullRequests)

    return <>
        <ReportDescription />
        <PullRequestTrendsTeam
            pullRequests={updatedPullRequests}
        />
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            tableOpenedByDefault={true}
        />
        <TeamTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            allRepos={allRepos}
        />
        <IssuesTrends />
        <UserTrends />
    </>
}

type State = {
    pullRequests: PullRequest[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    userIds: state.fetches.userIds,
})

export default connect(mapStateToProps)(Team)
