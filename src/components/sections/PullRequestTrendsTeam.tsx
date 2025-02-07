

import { useTheme } from "@/components/ThemeProvider"
import { graphColors } from '@/components/colors'
import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'
import Line from '@/components/charts/Line'
import { formatMarkers } from '@/format/releaseData'
import { useDataStore, useFetchStore } from "@/state/fetch"
import { PullRequest } from "@/types/FormattedData"

type PullRequestTrendsTeamProps = {
    pullRequests: PullRequest[]
}
const PullRequestTrendsTeam = ({ pullRequests = [] }:PullRequestTrendsTeamProps) => {
    const {
        events = [],
        usersInfo = {},
    } = useFetchStore((state) => state)
    const releases = useDataStore(state => state.releases)

    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const markers = formatMarkers({ events, releases, usersInfo })

    return pullRequests.length > 0 && (
        <Paper>
            <ChartDescription
                title="Team's contribution spread"
                expandText='guidance'
            >
                <p>Questions worth asking (with team context):</p>
                <ul>
                    <li>Is there a healthy percentage spread?</li>
                    <li>Are the Approval and comments spreads similar?</li>
                    <li>Any insights or things you would like to try to impact these metrics?</li>
                </ul>
            </ChartDescription>
            <p>Y axis is the percentage spread of approvals and comments within the active team*, 100% is an EVEN spread across the team, 0% is contribution from only ONE engineer.</p>
            <GraphsWrap>
                <Line
                    title="Percentage spread within team for "
                    combineTitles={true}
                    markers={markers}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Comments given',
                                    color: colorA,
                                    dataKey: 'comments',
                                    groupMath: 'teamDistribution',
                                    yMax: 100,
                                    data: pullRequests,
                                },
                                {
                                    label: 'Approvals given',
                                    color: colorB,
                                    dataKey: 'approvals',
                                    groupMath: 'teamDistribution',
                                    yMax: 100,
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'left',
                        },
                    ]}
                />
            </GraphsWrap>
            <p>*Active team per data point are those who have approved, commented or raised a PR within that time frame.</p>
        </Paper>
    )
}

export default PullRequestTrendsTeam

