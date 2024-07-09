

import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles'

import Paper from '../shared/Paper'
import { P, UL, LI } from '../shared/StyledTags'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'
import { EventInfo, PullRequest } from '../../types/FormattedData';

type PullRequestTrendsProps = {
    pullRequests: PullRequest[];
    releases: EventInfo[];
}
const PullRequestTrendsTeam = ({
    pullRequests = [],
    releases = [],
}:PullRequestTrendsProps) => {
    const theme:Theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
    return pullRequests.length > 0 && (
        <Paper>
            <ChartDescription
                title="Team's contribution spread"
                expandText='guidance'
            >
                <P>Questions worth asking (with team context):</P>
                <UL>
                    <LI>Is there a healthy percentage spread?</LI>
                    <LI>Are the Approval and comments spreads similar?</LI>
                    <LI>Any insights or things you would like to try to impact these metrics?</LI>
                </UL>
            </ChartDescription>
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
