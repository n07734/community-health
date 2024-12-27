import { connect } from 'react-redux'
import { PullRequest } from '@/types/FormattedData'
import { FetchInfo, UserDataNumbersKeys, UsersInfo } from '@/types/State'

import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'

import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import CustomGraphs from './sections/CustomGraphs'
import ReportDescription from './sections/ReportDescription'
import Pie from './charts/Pie'
import Chord from './charts/Chord'
import IssuesTrends from './sections/IssuesTrends'
import Bar from './charts/Bar'

import { sortByKeys } from '@/utils'
import { chunkData, rainbowData } from './charts/lineHelpers'
import formatUserData from '@/format/userData'
import { useShowNames } from '@/state/ShowNamesProvider'

type IndividualProps = {
    pullRequests: PullRequest[]
    reviewedPullRequests: PullRequest[]
    userIds: string[]
    usersInfo: UsersInfo
}
const Individual = ({
    pullRequests = [],
    reviewedPullRequests = [],
    userIds = [],
    usersInfo = {},
}:IndividualProps) => {
    const [userId] = userIds
    const { showNames } = useShowNames()
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    type BarData = {
        [key: string]:Record<string, number>
    }
    const allRepos:Record<string, number> = {}
    const allOrgs:Record<string, number> = {}
    const barMap:BarData = {}
    pullRequests
        .forEach((prData) => {
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
        })

    const updatedUsersInfo:UsersInfo = {
        ...usersInfo,
    }
    reviewedPullRequests
        .map((prData) => {
            const author = prData.author
            updatedUsersInfo[author] = { userId: author }

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

    const usersData = formatUserData(pullRequests.concat(reviewedPullRequests), updatedUsersInfo, userId)
    const keys:UserDataNumbersKeys[] = [
        'commentsGiven',
        'approvalsGiven',
    ]
    const sortedUsers = usersData
        .sort(sortByKeys(keys))

    const chunkyData = chunkData(pullRequests)
    const repoPie = rainbowData('repo', allRepos)

    return <>
        <ReportDescription />
        <Paper>
            <GraphsWrap>
                <div className="flex flex-wrap justify-center w-full">
                    <Bar
                        data={barData}
                        indexBy="name"
                        title="Comments"
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

                <div className="w-full flex flex-wrap justify-center gap-4">
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
            pullRequests={pullRequests}
            chunkyData={chunkyData}
            tableOpenedByDefault={true}
        />
        <IssuesTrends />
    </>
}

type State = {
    pullRequests: PullRequest[]
    reviewedPullRequests: PullRequest[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    reviewedPullRequests: state.reviewedPullRequests,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(Individual)
