import { connect } from 'react-redux'
import { useTheme, withStyles } from '@mui/styles'

import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import CustomGraphs from './sections/CustomGraphs'
import ReportDescription from './sections/ReportDescription'
import { chunkData, rainbowData } from './charts/lineHelpers'
import Pie from './charts/Pie'
import Chord from './charts/Chord'
import IssuesTrends from './sections/IssuesTrends'
import Bar from './charts/Bar'
import { sortByKeys } from '../utils'
import formatUserData from '../format/userData'
import { useShowNames } from '../state/ShowNamesProvider'

const Individual = ({
    pullRequests = [],
    reviewedPullRequests = [],
    userIds = [],
    usersInfo = {},
    classes = {},
} = {}) => {
    const [userId] = userIds
    const theme = useTheme();
    const { showNames } = useShowNames()

    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const allRepos = {}
    const allOrgs = {}
    const barMap = {}
    const updatedPullRequests = pullRequests
        .map((prData = {}) => {
            const commenters = prData.commenters || {}
            Object.keys(commenters).forEach((author) => {
                const value = commenters[author] || 0
                if (!barMap[author]) {
                    barMap[author] = {}
                }
                barMap[author].commentsReceived = (barMap[author].commentsReceived || 0) + value
            })

            const approvers = prData.approvers || {}
            Object.keys(approvers).forEach((author) => {
                const value = approvers[author] || 0
                if (!barMap[author]) {
                    barMap[author] = {}
                }
                barMap[author].approvalsReceived = (barMap[author].approvalsReceived || 0) + value
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

    const udpatedUsersInfo = {
        ...usersInfo,
    }
    reviewedPullRequests
        .map((prData = {}) => {
            const author = prData.author
            udpatedUsersInfo[author] = { userId: author }

            const commentCount = prData?.commenters?.[userId] || 0
            const approvalCount = prData?.approvers?.[userId] || 0

            if (!barMap[author]) {
                barMap[author] = {}
            }
            barMap[author].commentsGiven = (barMap[author].commentsGiven || 0) + commentCount
            barMap[author].approvalsGiven = (barMap[author].approvalsGiven || 0) + approvalCount
        })

    const barData = Object.entries(barMap)
        .map(([author, info],i) => ({
            ...info,
            // Needs white space padding to keep the bars
            author: showNames ? author : `${Array(i).fill(' ').join('')}Spartacus`,
            name: showNames ? usersInfo[author]?.name || author : `${Array(i).fill(' ').join('')}Spartacus`,
        }))

    const usersData = formatUserData(pullRequests.concat(reviewedPullRequests), udpatedUsersInfo, userId)
    const sortedUsers = usersData
        .sort(sortByKeys(['commentsByUser, approvalsByUser']))

    const chunkyData = chunkData(updatedPullRequests)
    const repoPie = rainbowData('repo', allRepos)

    return <>
        <ReportDescription />
        <Paper>
            <GraphsWrap>
            <div className={classes.barsWrap}>
                    <Bar
                        data={barData}
                        indexBy="name"
                        title="Comments"
                        combineTitles={true}
                        sortBy="commentsGiven"
                        bars={[
                            {
                                dataKey: 'commentsGiven',
                                color: colorA,
                                label: 'given',
                            },
                            {
                                dataKey: 'commentsReceived',
                                color: colorB,
                                label: 'received',
                            },
                        ]}
                    />
                    <Bar
                        data={barData}
                        indexBy="name"
                        title="Approvals"
                        combineTitles={true}
                        sortBy="approvalsGiven"
                        bars={[
                            {
                                dataKey: 'approvalsGiven',
                                color: colorA,
                                label: 'given',
                            },
                            {
                                dataKey: 'approvalsReceived',
                                color: colorB,
                                label: 'received',
                            },
                        ]}
                    />
                </div>

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
            </GraphsWrap>
        </Paper>
        <CustomGraphs
            pullRequests={updatedPullRequests}
            chunkyData={chunkyData}
            tableOpenedByDefault={true}
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
    barsWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        '& > div': {
            width: '50%',
            '@media (max-width: 750px)': {
                width: '100%',
            },
        },
    },
})

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    reviewedPullRequests: state.reviewedPullRequests,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(withStyles(styles)(Individual))
