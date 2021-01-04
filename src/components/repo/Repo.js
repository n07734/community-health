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
    preFetchedRepo = '',
} = {}) => <>
    <RepoDescription repoInfo={repoInfo} preFetchedRepo={preFetchedRepo} />
    <TeamTrends usersData={usersData} />
    <PullRequestTrends pullRequests={pullRequests} releases={releases}/>
    <IssuesTrends issues={issues} releases={releases}/>
    <UserTrends usersData={usersData} />
    <UserList usersData={usersData} />
</>

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    usersData: state.usersData,
    issues: state.issues,
    releases: state.releases,
    repoInfo: state.repoInfo,
    preFetchedRepo: state.preFetchedRepo,
})

export default connect(mapStateToProps)(RepoView)
