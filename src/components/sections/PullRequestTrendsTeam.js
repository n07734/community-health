

import Paper from '../shared/Paper'
import { P } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'

const PullRequestTrendsTeam = ({
    pullRequests = [],
    releases = [],
} = {}) => {
    return pullRequests.length > 0 && (
        <Paper>
            <ChartDescription
                title="Team's contribution spread"
            />
            <P>Y axis is the percentage spread of approvals and comments within the active team*, 100% is an EVEN spread across the team, 0% is contribution from only ONE engineer.</P>
            <GraphsWrap>
                <Line
                    title="Percentage spread within team for "
                    combineTitles={true}
                    markers={releases}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'Comments given',
                                    color: '#1F77B4',
                                    dataKey: 'teamOnlyComments',
                                    groupMath: 'teamDistribution',
                                    yMax: 100,
                                },
                                {
                                    label: 'Approvals given',
                                    color: '#E82573',
                                    dataKey: 'teamOnlyApprovals',
                                    groupMath: 'teamDistribution',
                                    yMax: 100,
                                },
                            ],
                            xAxis: 'left',
                            data: pullRequests,
                        },
                    ]}
                />
            </GraphsWrap>
            <P>*Active team per data point are those who have approved, commented or raised a PR within that time frame.</P>
        </Paper>
    )
}

export default PullRequestTrendsTeam
