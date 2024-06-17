
import { connect } from 'react-redux'

import PullRequestTrendsTeam from './sections/PullRequestTrendsTeam'
import CustomGraphs from './sections/CustomGraphs'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'
import { formatMarkers } from '../format/releaseData'

const Team = ({
    pullRequests = [],
    userIds = [],
    events = [],
    usersInfo = {},
} = {}) => {
    const teamOnlyData = (data = {}) => {
        const teamData = {}
        userIds
            .forEach(userId => {
                const usersData = data[userId]
                if (usersData) {
                    teamData[userId] = usersData
                }
            })

        return teamData
    }

    const allRepos = {}
    const updatedPullRequests = pullRequests
        .map((prData = {}, i) => {
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
            chunkyData={chunkyData}
            releases={markers}
        />
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            releases={markers}
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

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    userIds: state.fetches.userIds,
    events: state.fetches.events,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(Team)
