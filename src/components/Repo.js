import React from 'react'
import { connect } from 'react-redux'

import PullRequestTrends from './sections/PullRequestTrends'
import PullRequestCustom from './sections/PullRequestCustom'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import Sentiment from './sections/Sentiment'
import UserTrends from './sections/UserTrends'
import UserList from './sections/UserList'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'

const RepoView = ({ pullRequests = [] } = {}) => {
    const updatedPullRequests = pullRequests
        .map((prData = {}) => ({
            ...prData,
            commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0),
            [`${prData.author}-commentsSentimentScore`]: prData.commentSentimentScore,
            [`${prData.author}-commentAuthorSentimentScore`]: prData.commentAuthorSentimentScore,
        }))

    const chunkyData = chunkData(updatedPullRequests)

    return <>
        <ReportDescription />
        <TeamTrends />
        <PullRequestCustom
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <Sentiment
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <PullRequestTrends  chunkyData={chunkyData} />
        <IssuesTrends />
        <UserTrends />
        <UserList />
    </>
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(RepoView)