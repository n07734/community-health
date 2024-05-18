

import { useTheme } from '@material-ui/core/styles';

import Paper from '../shared/Paper'
import { P } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'

const PullRequestTrendsTeam = ({
    pullRequests = [],
    releases = [],
} = {}) => {
    const theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
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
                                    color: colorA,
                                    dataKey: 'teamOnlyComments',
                                    groupMath: 'teamDistribution',
                                    yMax: 100,
                                },
                                {
                                    label: 'Approvals given',
                                    color: colorB,
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
