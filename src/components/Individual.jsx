
import { connect } from 'react-redux'
import { useTheme } from '@mui/styles'

import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import CustomGraphs from './sections/CustomGraphs'
import ReportDescription from './sections/ReportDescription'
import { chunkData, rainbowData } from './charts/lineHelpers'
import Pie from './charts/Pie'
import Line from './charts/Line'
import IssuesTrends from './sections/IssuesTrends'
import Bar from './charts/Bar'

const Individual = ({
    pullRequests = [],
    releases = [],
} = {}) => {
    const theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const allRepos = {}
    const allOrgs = {}
    const barMap = {}
    const updatedPullRequests = pullRequests
        .map((prData = {}) => {
            const commenters = prData.commenters || {}
            Object.keys(commenters).forEach((author) => {
                if (!barMap[author]) {
                    barMap[author] = {}
                }
                const value = commenters[author] || 0
                barMap[author].comments = (barMap[author].comments || 0) + value
            })

            const approvers = prData.approvers || {}
            Object.keys(approvers).forEach((author) => {
                if (!barMap[author]) {
                    barMap[author] = {}
                }
                const value = approvers[author] || 0
                barMap[author].approvals = (barMap[author].approvals || 0) + value
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

    const commentBarData = Object.entries(barMap)
        .map(([author, { comments = 0,  approvals = 0}]) => ({ author, comments,  approvals}))

    const chunkyData = chunkData(updatedPullRequests)
    const repoPie = rainbowData('repo', allRepos)

    return <>
        <ReportDescription />
        <Paper>
            <GraphsWrap>
            <Bar
                data={commentBarData}
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

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
})

export default connect(mapStateToProps)(Individual)
