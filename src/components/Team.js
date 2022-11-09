import React from 'react'

import PullRequestTrends from './sections/PullRequestTrends'
import PullRequestCustom from './sections/PullRequestCustom'
import IssuesTrends from './sections/IssuesTrends'
import TeamTrends from './sections/TeamTrends'
import UserTrends from './sections/UserTrends'
import RepoSplit from './sections/RepoSplit'
import Sentiment from './sections/Sentiment'
import ReportDescription from './sections/ReportDescription'

const Team = () => <>
    <ReportDescription />
    <TeamTrends />
    <PullRequestCustom />
    <Sentiment />
    <RepoSplit />
    <PullRequestTrends />
    <IssuesTrends />
    <UserTrends />
</>

export default Team
