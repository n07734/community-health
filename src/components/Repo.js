import React from 'react'

import PullRequestTrends from './sections/PullRequestTrends'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import UserList from './sections/UserList'
import ReportDescription from './sections/ReportDescription'

const RepoView = () => <>
    <ReportDescription />
    <TeamTrends />
    <PullRequestTrends />
    <IssuesTrends />
    <UserTrends />
    <UserList />
</>

export default RepoView
