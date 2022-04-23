import React from 'react'
import { connect } from 'react-redux'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import Line from '../charts/Line'

const formatIssueData = (data = []) => data
    .map((item) => ({
        mergedAt: item.mergedAt,
        ...(
            item.isBug
                ? { bug: 1 }
                : { issue: 1 }
        ),
    }))

const IssuesTrends = ({
    issues = [],
    releases = [],
} = {}) => {
    const data = formatIssueData(issues)

    return data && data.length > 0 && (
        <Paper>
            <ChartDescription
                title="Feature and bug trends"
            />
            <Line
                markers={releases}
                data={[
                    {
                        lines: [
                            {
                                label: 'Issues',
                                color: '#1f77b4',
                                dataKey: 'issue',
                                groupMath: 'count',
                            },
                            {
                                label: 'Bugs*',
                                color: '#e82573',
                                dataKey: 'bug',
                                groupMath: 'count',
                            },
                        ],
                        xAxis: 'left',
                        data,
                    },
                ]}
            />
            <P>*Bugs in this graph are issues that have a title or a label that contains the word 'bug'</P>
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    issues: state.issues,
    releases: state.releases,
})

export default connect(mapStateToProps)(IssuesTrends)
