
import { connect } from 'react-redux'
import { UsersInfo } from '@/types/State'
import { EventInfo, PullRequest } from '@/types/FormattedData'

import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'

import { useShowNames } from '@/state/ShowNamesProvider'
import Line from '@/components/charts/Line'
// import Scatterplot from '@/components/charts/Scatterplot'
import { splitByAuthor } from '@/components/charts/lineHelpers'
import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'
import { LineData, TableData } from '@/types/Graphs'


type PullRequestTrendsProps = {
    chunkyData: TableData[][]
    pullRequests: PullRequest[]
    releases: EventInfo[]
    userIds: string[]
    usersInfo: UsersInfo
}
const PullRequestTrends = ({
    chunkyData = [],
    pullRequests = [],
    releases = [],
    userIds = [],
    usersInfo = {},
}:PullRequestTrendsProps) => {
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary
    const colorC = graphColors[theme].tertiary

    const { showNames } = useShowNames()

    const isTeamPage = userIds.length > 0
    const byAuthorData = isTeamPage
        ? splitByAuthor({pullRequests, showNames, usersInfo})
        : []

    return pullRequests.length > 0 && (
        <Paper>
            <ChartDescription
                title="Pull Request trends"
            >
                {
                    releases.length > 1 && <div>
                        <p>Vertical lines are releases: Green is a Major release, solid purple is Minor and dotted purple is Patch or Alpha</p>
                    </div>
                }
            </ChartDescription>
            <GraphsWrap>

                {
                    isTeamPage && <>
                        <Line
                            title="PRs by author"
                            markers={releases}
                            showLegends={true}
                            data={byAuthorData}
                            tableData={chunkyData}
                            tableKeys={['author', 'repo']}
                        />
                    </>
                }
                { /* TODO:Scatterplot is slow, maybe trim data */}
                {/* <Scatterplot
                    markers={releases}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'PR size',
                                    color: colorA,
                                    dataKey: 'prSize',
                                },
                            ],
                            xAxis: 'left',
                            data: pullRequests as LineData[],
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['author', 'prSize']}
                /> */}
                <Line
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
                            data: pullRequests as LineData[],
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['author']}
                />

                <Line
                    markers={releases}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Comments',
                                    color: colorA,
                                    dataKey: 'comments',
                                },
                                {
                                    label: 'Approvals',
                                    color: colorB,
                                    dataKey: 'approvals',
                                },
                            ],
                            xAxis: 'left',
                            data: pullRequests as LineData[],
                        },
                        {
                            lines: [
                                {
                                    label: 'PR Size',
                                    color: colorC,
                                    dataKey: 'prSize',
                                },
                            ],
                            xAxis: 'right',
                            data: pullRequests as LineData[],
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['comments', 'approvals', 'prSize', 'author']}
                />

                <Line
                    markers={releases}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Age (days)',
                                    color: colorB,
                                    dataKey: 'age',
                                },
                            ],
                            xAxis: 'left',
                            data: pullRequests as LineData[],
                        },
                        {
                            lines: [
                                {
                                    label: 'PR Size',
                                    color: colorC,
                                    dataKey: 'prSize',
                                },
                            ],
                            xAxis: 'right',
                            data: pullRequests as LineData[],
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['age', 'prSize', 'author']}
                />
            </GraphsWrap>
        </Paper>
    )
}

type State = {
    releases: EventInfo[],
    fetches: {
        userIds: string[],
        usersInfo: UsersInfo,
    },

}
const mapStateToProps = (state: State) => ({
    releases: state.releases,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(PullRequestTrends)
