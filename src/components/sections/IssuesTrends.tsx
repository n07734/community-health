
import { connect } from 'react-redux'

import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'
import { EventInfo, Issue } from '@/types/FormattedData'

import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'
import Line from '@/components/charts/Line'
import { chunkData } from '@/components/charts/lineHelpers'

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
}
const IssuesTrends = ({
    issues = [],
    releases = [],
}:IssuesTrendsProps) => {
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const data = formatIssueData(issues)
    const chunkyData = chunkData(issues)

    return data && data.length > 0 && (
        <Paper>
            <ChartDescription
                title="Feature and bug trends"
            />
            <GraphsWrap>
                <Line
                    markers={releases}
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
}
const mapStateToProps = (state:State) => ({
    issues: state.issues,
    releases: state.releases,
})

export default connect(mapStateToProps)(IssuesTrends)
