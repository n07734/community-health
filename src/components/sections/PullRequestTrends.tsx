
import { connect } from 'react-redux'
import { FetchInfo, SavedEvent, UsersInfo } from '@/types/State'
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
import { TableData } from '@/types/Graphs'
import { formatMarkers } from '@/format/releaseData'

type PullRequestTrendsProps = {
    chunkyData: TableData[][]
    pullRequests: PullRequest[]
    releases: EventInfo[]
    userIds: string[]
    events: SavedEvent[]
    usersInfo: UsersInfo
}
const PullRequestTrends = ({
    chunkyData = [],
    pullRequests = [],
    releases = [],
    events = [],
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

    const markers = formatMarkers({ events, releases, usersInfo })

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
                            markers={markers}
                            showLegends={true}
                            data={byAuthorData}
                            tableData={chunkyData}
                            tableKeys={['author', 'repo']}
                        />
                    </>
                }
                { /* TODO:Scatterplot is slow, maybe trim data */}
                {/* <Scatterplot
                    markers={markers}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'PR size',
                                    color: colorA,
                                    dataKey: 'prSize',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'left',
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['author', 'prSize']}
                /> */}
                <Line
                    markers={markers}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'PRs over time',
                                    color: colorA,
                                    dataKey: 'url',
                                    groupMath: 'count',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'left',
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['author']}
                />

                <Line
                    markers={markers}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Comments',
                                    color: colorA,
                                    dataKey: 'comments',
                                    data: pullRequests,
                                },
                                {
                                    label: 'Approvals',
                                    color: colorB,
                                    dataKey: 'approvals',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'left',
                        },
                        {
                            lines: [
                                {
                                    label: 'PR Size',
                                    color: colorC,
                                    dataKey: 'prSize',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'right',
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['comments', 'approvals', 'prSize', 'author']}
                />

                <Line
                    markers={markers}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Age (days)',
                                    color: colorB,
                                    dataKey: 'age',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'left',
                        },
                        {
                            lines: [
                                {
                                    label: 'PR Size',
                                    color: colorC,
                                    dataKey: 'prSize',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'right',
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
    releases: EventInfo[]
    fetches: FetchInfo,
}
const mapStateToProps = (state: State) => ({
    releases: state.releases,
    events: state.fetches.events,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(PullRequestTrends)