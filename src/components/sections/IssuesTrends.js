import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

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
    classes,
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
            <P className={classes.fullP}>*Bugs in this graph are issues that have a title or a label that contains the word 'bug'</P>
        </Paper>
    )
}

const styles = theme => ({
    'fullP': {
        width: '100%',
        textAlign: 'center',
    },
})

const mapStateToProps = (state) => ({
    issues: state.issues,
    releases: state.releases,
})

export default connect(mapStateToProps)(withStyles(styles)(IssuesTrends))