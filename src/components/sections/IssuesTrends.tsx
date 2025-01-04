import { useShallow } from 'zustand/react/shallow'
import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'
import { Issue } from '@/types/FormattedData'
import { IssueIssue } from '@/types/Graphs'

import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'
import Line from '@/components/charts/Line'
import { chunkData } from '@/components/charts/lineHelpers'
import { formatMarkers } from '@/format/releaseData'
import { useDataStore, useFetchStore } from '@/state/fetch'

const formatIssueData = (data:Issue[] = []): IssueIssue[] => data
    .map((item) => ({
        mergedAt: item.mergedAt,
        ...(
            item.isBug
                ? { bug: 1 }
                : { issue: 1 }
        ),
    }))

const IssuesTrends = () => {
    const releases = useDataStore(useShallow(state => state.releases))
    const issues = useDataStore(state => state.issues)

    const usersInfo = useFetchStore(state => state.usersInfo)
    const events = useFetchStore(state => state.events)


    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const data = formatIssueData(issues)
    const chunkyData = chunkData(issues)

    const markers = formatMarkers({ events, releases, usersInfo })

    const issuesData:IssueIssue[] = []
    const bugsData: IssueIssue[] = []
    data.forEach((item) => {
        if (item.issue) {
            issuesData.push(item)
        }
        if (item.bug) {
            bugsData.push(item)
        }
    })

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
                                    dataKey: 'issue',
                                    groupMath: 'count',
                                    data: issuesData,
                                },
                                {
                                    label: 'Bugs*',
                                    color: colorB,
                                    dataKey: 'bug',
                                    groupMath: 'count',
                                    data: bugsData,
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

export default IssuesTrends
