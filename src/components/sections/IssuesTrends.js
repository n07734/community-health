
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@material-ui/core/styles'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'
import { chunkData } from '../charts/lineHelpers'


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
    const theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

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
                                    filterForKey: 'issue',
                                    groupMath: 'count',
                                },
                                {
                                    label: 'Bugs*',
                                    color: colorB,
                                    filterForKey: 'bug',
                                    groupMath: 'count',
                                },
                            ],
                            xAxis: 'left',
                            data,
                        },
                    ]}
                    tableKeys={['isBug']}
                    tableData={chunkyData}
                />
            </GraphsWrap>
            <P className={classes.fullP}>*Bugs in this graph are issues that have a title or a label that contains the word 'bug'</P>
        </Paper>
    )
}

const styles = () => ({
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
