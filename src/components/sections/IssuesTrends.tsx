
import { connect } from 'react-redux'

import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'
import { EventInfo, Issue } from '@/types/FormattedData'

import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'
import Line from '@/components/charts/Line'
import { chunkData } from '@/components/charts/lineHelpers'
import { FetchInfo, SavedEvent, UsersInfo } from '@/types/State'
import { formatMarkers } from '@/format/releaseData'

const formatIssueData = (data:Issue[] = []) => data
    .map((item) => ({
        mergedAt: item.mergedAt,
        ...(
            item.isBug
                ? { bug: 1 }
                : { issue: 1 }
        ),
    }))

type IssuesTrendsProps = {
    issues: Issue[]
    releases: EventInfo[]
    events: SavedEvent[]
    usersInfo: UsersInfo
}
const IssuesTrends = ({
    issues = [],
    releases = [],
    events = [],
    usersInfo = {},
}:IssuesTrendsProps) => {
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const data = formatIssueData(issues)
    const chunkyData = chunkData(issues)

    const markers = formatMarkers({ events, releases, usersInfo })

    return data && data.length > 0 && (
        <Paper>
            <ChartDescription
                title="Feature and bug trends"
            />
            <GraphsWrap>
                <Line
                    markers={markers}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Issues',
                                    color: colorA,
                                    filterForKey: true,
                                    dataKey: 'issue',
                                    groupMath: 'count',
                                    data,
                                },
                                {
                                    label: 'Bugs*',
                                    color: colorB,
                                    filterForKey: true,
                                    dataKey: 'bug',
                                    groupMath: 'count',
                                    data,
                                },
                            ],
                            xAxis: 'left',
                        },
                    ]}
                    tableKeys={['isBug']}
                    tableData={chunkyData}
                />
            </GraphsWrap>
            <p className="w-full text-center">*Bugs in this graph are issues that have a title or a label that contains the word 'bug'</p>
        </Paper>
    )
}

type State = {
    issues: Issue[]
    releases: EventInfo[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    issues: state.issues,
    releases: state.releases,
    events: state.fetches.events,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(IssuesTrends)
