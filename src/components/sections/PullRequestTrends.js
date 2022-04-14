import React from 'react'
import { connect } from 'react-redux'
import { useTheme } from '@material-ui/core/styles';

import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import { P } from '../shared/StyledTags'

import Line from '../charts/Line'

const PullRequestTrends = ({
    pullRequests = [],
    releases = [],
} = {}) => {
    const { type } = useTheme();
    return (
        <Paper>
            <ChartDescription
                title="Pull Request trends"
            >
                {
                    releases.length > 1 && <div>
                        <P>Vertical lines are releases: Green is a Major release, solid purple is Minor and dotted purple is Patch or Alpha</P>
                    </div>
                }
            </ChartDescription>
            <Line
                markers={releases}
                data={[
                    {
                        lines: [
                            {
                                label: 'Comments',
                                color: '#1f77b4',
                                dataKey: 'comments',
                            },
                            {
                                label: 'Approvals',
                                color: '#e82573',
                                dataKey: 'approvals',
                            },
                        ],
                        xAxis: 'left',
                        data: pullRequests,
                    },
                    {
                        lines: [
                            {
                                label: 'PR Size',
                                color: type === 'dark' ? '#e2e2e2' : '#777',
                                dataKey: 'prSize',
                            },
                        ],
                        xAxis: 'right',
                        data: pullRequests,
                    },
                ]}
            />

            <Line
                markers={releases}
                data={[
                    {
                        lines: [
                            {
                                label: 'Age (days)',
                                color: '#e82573',
                                dataKey: 'age',
                            },
                        ],
                        xAxis: 'left',
                        data: pullRequests,
                    },
                    {
                        lines: [
                            {
                                label: 'PR Size',
                                color: type === 'dark' ? '#e2e2e2' : '#777',
                                dataKey: 'prSize',
                            },
                        ],
                        xAxis: 'right',
                        data: pullRequests,
                    },
                ]}
            />
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
})

export default connect(mapStateToProps)(PullRequestTrends)
