import React from 'react'
import { connect } from 'react-redux'

import PullRequestTrends from './sections/PullRequestTrends'
import PullRequestCustom from './sections/PullRequestCustom'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import RepoSplit from './sections/RepoSplit'
import Sentiment from './sections/Sentiment'
import ReportDescription from './sections/ReportDescription'
import { chunkData } from './charts/lineHelpers'

const Team = ({ pullRequests = [] } = {}) => {
    const allRepos = {}
    const allOrgs = {}

    const updatedPullRequests = pullRequests
        .map((prData = {}) => {
            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1
            allOrgs[prData.org] = (allOrgs[prData.org] || 0) + 1
            return {
                ...prData,
                [`repo-${prData.repo}`]: 1,
                commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0)
            }
        })

    const chunkyData = chunkData(updatedPullRequests)

    return <>
        <ReportDescription />
        <TeamTrends />
        <PullRequestCustom
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <Sentiment chunkyData={chunkyData} />
        <RepoSplit
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            allRepos={allRepos}
            allOrgs={allOrgs}
        />
        <PullRequestTrends  chunkyData={chunkyData} />
        <IssuesTrends />
        <UserTrends />
    </>
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(Team)
