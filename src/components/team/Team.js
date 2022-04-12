import React from 'react'
import { connect } from 'react-redux'

import PullRequestTrends from '../repo/PullRequestTrends'
import IssuesTrends from '../repo/IssuesTrends'
import TeamTrends from '../repo/TeamTrends'
import UserTrends from '../repo/UserTrends'
import UserList from '../repo/UserList'
import RepoDescription from '../repo/RepoDescription'
import Line from '../charts/Line'
import Paper from '../shared/Paper'

const Team = ({
    pullRequests = [],
    usersData = [],
    issues = [],
    releases = [],
    repoInfo = {},
    preFetchedRepo = '',
    userIds = [],
} = {}) => {

    const sentPRData = pullRequests.map(prData => ({
        ...prData,
        [`${prData.author}-commentsSentimentScore`]: prData.commentsSentimentScore
    }))
    const colors = ['#E82573', '#8b4ff0', '#1F77B4', '#4ECC7A', '#DBD523', '#EB9830', '#D14B41']


    return (<>
        <p>TEAM</p>
        <RepoDescription repoInfo={repoInfo} preFetchedRepo={preFetchedRepo} />
        <TeamTrends usersData={usersData} />
        <Paper>
            <Line
                markers={releases}
                showLegends={true}
                title="Sentiment received in PR"
                data={[
                    {
                        lines: [
                            {
                                label: 'all',
                                color: colors[0],
                                dataKey: 'commentsSentimentScore',
                            },
                            ...(
                                userIds
                                    .map((userId, i) => ({
                                        label: `${userId}`,
                                        color: colors[i + 1],
                                        dataKey: `${userId}-commentsSentimentScore`,
                                    }))
                            )
                        ],
                        xAxis: 'left',
                        data: sentPRData,
                    },
                ]}
            />
        </Paper>

        <PullRequestTrends pullRequests={pullRequests} releases={releases}/>
        <IssuesTrends issues={issues} releases={releases}/>
        <UserTrends usersData={usersData} />
        <UserList usersData={usersData} />
    </>)
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    usersData: state.usersData,
    issues: state.issues,
    releases: state.releases,
    repoInfo: state.repoInfo,
    preFetchedRepo: state.preFetchedRepo,
    teamName: state.teamName || 'core',
    userIds: state.userIds || ['bvaughn','gaearon','acdlite','sebmarkbage'],
})

export default connect(mapStateToProps)(Team)
