
import { useTheme } from '@mui/styles'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'
import Pie from '../charts/Pie'
import { rainbowData } from '../charts/lineHelpers'
import Paper from '../shared/Paper'

const RepoSplit = ({
    pullRequests = [],
    chunkyData = [],
    allRepos = {},
    allOrgs = {},
} = {}) => {
    const theme = useTheme();
    const colors = theme.palette.colorList

    const repoPie = rainbowData('repo', allRepos)
    const uniqueRepos = repoPie.reportItems

    const lines = uniqueRepos
        .map((repo, i) => ({
            label: repo,
            color: colors[i % colors.length],
            filterForKey: `repo-${repo}`,
            groupMath: 'count',
        }))

    const orgPie = rainbowData('org', allOrgs)

    return pullRequests.length > 0 && (<>
        <Paper>
            <ChartDescription title={repoPie.sectionTitle} />
            <GraphsWrap>
                <Pie
                    data={repoPie.pieData}
                    title="PR repository rainbow"
                />
                <Line
                    title="Repository PRs over time"
                    showLegends={true}
                    data={[
                        {
                            lines,
                            xAxis: 'left',
                            data: pullRequests,
                        },
                    ]}
                    tableKeys={['repo', 'author']}
                    tableData={chunkyData}
                />
            </GraphsWrap>

            <ChartDescription title={orgPie.sectionTitle} />
            <GraphsWrap>
                <Pie
                    data={orgPie.pieData}
                    title="PR Orgs rainbow"
                />
            </GraphsWrap>
        </Paper>
    </>)
}

export default RepoSplit
