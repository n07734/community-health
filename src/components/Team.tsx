
import { connect } from 'react-redux'

import PullRequestTrendsTeam from './sections/PullRequestTrendsTeam'
import CustomGraphs from './sections/CustomGraphs'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'
import { formatMarkers } from '../format/releaseData'
import { PullRequest } from '../types/FormattedData'
import { FetchInfo, SavedEvent, UsersInfo } from '../types/State'
import { ObjNumbers } from '../types/Components'

type TeamProps = {
    pullRequests: PullRequest[]
    userIds: string[]
    events: SavedEvent[]
    usersInfo: UsersInfo
}
const Team = ({
    pullRequests = [],
    userIds = [],
    events = [],
    usersInfo = {},
}:TeamProps) => {
    const teamOnlyData = (data:ObjNumbers) => {
        const teamData:ObjNumbers = {}
        userIds
            .forEach(userId => {
                const usersData = data?.[userId]
                if (usersData) {
                    teamData[userId] = usersData
                }
            })

        // console.log('teamData', teamData)

        return teamData
    }

    const allRepos:ObjNumbers = {}
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
    const markers = formatMarkers({ events, usersInfo })

    return <>
        <ReportDescription />
        <PullRequestTrendsTeam
            pullRequests={updatedPullRequests}
            releases={markers}
        />
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            releases={markers}
            tableOpenedByDefault={true}
        />
        <TeamTrends
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            releases={markers}
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
    events: state.fetches.events,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(Team)
