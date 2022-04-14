import React from 'react'

import PullRequestTrends from './sections/PullRequestTrends'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import UserList from './sections/UserList'
import RepoSplit from './sections/RepoSplit'
import Sentiment from './sections/Sentiment'
import RepoDescription from './sections/RepoDescription'

const Team = () => <>
    <RepoDescription />
    <TeamTrends />
    <RepoSplit />
    <Sentiment />
    <PullRequestTrends />
    <IssuesTrends />
    <UserTrends />
    <UserList />
</>

export default Team
