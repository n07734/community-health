import React from 'react'

import PullRequestTrends from './sections/PullRequestTrends'
import PullRequestCustom from './sections/PullRequestCustom'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import Sentiment from './sections/Sentiment'
import UserTrends from './sections/UserTrends'
import UserList from './sections/UserList'
import ReportDescription from './sections/ReportDescription'

const RepoView = () => <>
    <ReportDescription />
    <TeamTrends />
    <PullRequestCustom />
    <Sentiment />
    <PullRequestTrends />
    <IssuesTrends />
    <UserTrends />
    <UserList />
</>

export default RepoView
