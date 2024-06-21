import { connect } from 'react-redux'
import { useTheme, withStyles } from '@mui/styles'

import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import CustomGraphs from './sections/CustomGraphs'
import ReportDescription from './sections/ReportDescription'
import { chunkData, rainbowData } from './charts/lineHelpers'
import Pie from './charts/Pie'
import Line from './charts/Line'
import Chord from './charts/Chord'
import IssuesTrends from './sections/IssuesTrends'
import Bar from './charts/Bar'
import { sortByKeys } from '../utils'
import formatUserData from '../format/userData'

const Individual = ({
    pullRequests = [],
    reviewedPullRequests = [],
    releases = [],
    userIds = [],
    usersInfo = {},
    classes = {},
} = {}) => {
    const [userId] = userIds
    const theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const allRepos = {}
    const allOrgs = {}
    const receivedBarMap = {}
    const updatedPullRequests = pullRequests
        .map((prData = {}) => {
            const commenters = prData.commenters || {}
            Object.keys(commenters).forEach((author) => {
                if (!receivedBarMap[author]) {
                    receivedBarMap[author] = {}
                }
                const value = commenters[author] || 0
                receivedBarMap[author].comments = (receivedBarMap[author].comments || 0) + value
            })

            const approvers = prData.approvers || {}
            Object.keys(approvers).forEach((author) => {
                if (!receivedBarMap[author]) {
                    receivedBarMap[author] = {}
                }
                const value = approvers[author] || 0
                receivedBarMap[author].approvals = (receivedBarMap[author].approvals || 0) + value
            })

            allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1
            allOrgs[prData.org] = (allOrgs[prData.org] || 0) + 1
            return {
                ...prData,
                [`repo-${prData.repo}`]: 1,
                commentSentimentTotalScore: (prData.commentSentimentScore || 0) + (prData.commentAuthorSentimentScore || 0),
                [`${prData.author}-commentsSentimentScore`]: prData.commentSentimentScore,
                [`${prData.author}-commentAuthorSentimentScore`]: prData.commentAuthorSentimentScore,
            }
        })

    const commentsReceivedBarData = Object.entries(receivedBarMap)
        .map(([author, { comments = 0,  approvals = 0 }]) => ({ author, comments, approvals }))

    const givenBarMap = {}
    const udpatedUsersInfo = {
        ...usersInfo,
    }
    reviewedPullRequests
        .map((prData = {}) => {
            const author = prData.author
            udpatedUsersInfo[author] = { userId: author }
            if (!givenBarMap[author]) {
                givenBarMap[author] = {}
            }

            const commentCount = prData?.commenters?.[userId] || 0
            givenBarMap[author].comments = (givenBarMap[author].comments || 0) + commentCount

            const approvalCount = prData?.approvers?.[userId] || 0
            givenBarMap[author].approvals = (givenBarMap[author].approvals || 0) + approvalCount
        })

    const commentsGivenBarData = Object.entries(givenBarMap)
        .map(([author, { comments = 0,  approvals = 0 }]) => ({ author, comments, approvals }))

    const usersData = formatUserData(pullRequests.concat(reviewedPullRequests), udpatedUsersInfo, userId)
    const sortedUsers = usersData
        .sort(sortByKeys(['commentsByUser, approvalsByUser']))

    const chunkyData = chunkData(updatedPullRequests)
    const repoPie = rainbowData('repo', allRepos)

    return <>
        <ReportDescription />
        <Paper>
            <GraphsWrap>
            <Bar
                data={commentsGivenBarData}
                indexBy="author"
                title="Given"
                sortBy="comments"
                bars={[
                    {
                        dataKey: 'comments',
                        color: colorA,
                        label: 'comments',
                    },
                    {
                        dataKey: 'approvals',
                        color: colorB,
                        label: 'approvals',
                    },
                ]}
            />
            <Bar
                data={commentsReceivedBarData}
                indexBy="author"
                title="Received"
                sortBy="comments"
                bars={[
                    {
                        dataKey: 'comments',
                        color: colorA,
                        label: 'comments',
                    },
                    {
                        dataKey: 'approvals',
                        color: colorB,
                        label: 'approvals',
                    },
                ]}
            />
            <div className={classes.groupedCharts}>
                <Chord
                    data={sortedUsers}
                    preSorted={true}
                    dataKey="commentsByUser"
                    title="Comment contributions"
                />
                <Chord
                    data={sortedUsers}
                    preSorted={true}
                    dataKey="approvalsByUser"
                    title="Approval contributions"
                />
            </div>
            {
                repoPie.pieData.length > 0 &&
                    <Pie
                        data={repoPie.pieData}
                        title={repoPie.sectionTitle}
                    />
            }
            <Line
                title="PRs over time"
                markers={releases}
                data={[
                    {
                        lines: [
                            {
                                label: 'PRs over time',
                                color: colorA,
                                dataKey: 'url',
                                groupMath: 'count',
                            },
                        ],
                        xAxis: 'left',
                        data: updatedPullRequests,
                    },
                ]}
                tableData={chunkyData}
                tableKeys={['author']}
            />
            </GraphsWrap>
        </Paper>
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
        />
        <IssuesTrends />
    </>
}

const styles = () => ({
    groupedCharts: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 20px',
        '& p': {
            flexBasis: '100%',
            textAlign: 'center',
        },
    },
})

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    reviewedPullRequests: state.reviewedPullRequests,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
    releases: state.releases,
})

export default connect(mapStateToProps)(withStyles(styles)(Individual))
