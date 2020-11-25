import React from 'react'
import { connect } from 'react-redux'

import PullRequestTrends from './PullRequestTrends'
import IssuesTrends from './IssuesTrends'
import TeamTrends from './TeamTrends'
import UserTrends from './UserTrends'
import UserList from './UserList'
import RepoDescription from './RepoDescription'

const RepoView = ({
    pullRequests = [],
    usersData = [],
    issues = [],
    releases = [],
    repoInfo = {},
} = {}) => <>
    <RepoDescription repoInfo={repoInfo} />
    <PullRequestTrends pullRequests={pullRequests} releases={releases}/>
    <IssuesTrends issues={issues} releases={releases}/>
    <TeamTrends usersData={usersData} />
    <UserTrends usersData={usersData} />
    <UserList usersData={usersData} />
</>

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    usersData: state.usersData,
    issues: state.issues,
    releases: state.releases,
    repoInfo: state.repoInfo,
})

export default connect(mapStateToProps)(RepoView)