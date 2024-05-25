
import { connect } from 'react-redux'
import { useTheme } from '@material-ui/core/styles'

import Paper from './shared/Paper'
import GraphsWrap from './shared/GraphsWrap'
import CustomGraphs from './sections/CustomGraphs'
import ReportDescription from './sections/ReportDescription'
import { chunkData, rainbowData } from './charts/lineHelpers'
import Pie from './charts/Pie'
import Line from './charts/Line'
import IssuesTrends from './sections/IssuesTrends'

const Individual = ({
    pullRequests = [],
    releases = [],
} = {}) => {
    const theme = useTheme();
    const colorA = theme.palette.secondary.main

    const allRepos = {}
    const allOrgs = {}
    const updatedPullRequests = pullRequests
        .map((prData = {}) => {
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

    const chunkyData = chunkData(updatedPullRequests)
    const repoPie = rainbowData('repo', allRepos)
    const orgPie = rainbowData('org', allOrgs)

    return <>
        <ReportDescription />
        <Paper>
            <GraphsWrap>
            {
                repoPie.pieData.length > 0 &&
                    <Pie
                        data={repoPie.pieData}
                        title={repoPie.sectionTitle}
                    />
            }
            {
                orgPie.pieData.length > 0 &&
                    <Pie
                        data={orgPie.pieData}
                        title={orgPie.sectionTitle}
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
