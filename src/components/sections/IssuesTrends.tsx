
import { connect } from 'react-redux'
import { withStyles, useTheme, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { EventInfo, Issue } from '../../types/FormattedData'
import { GraphIssue } from '../../types/Graphs'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'
import { chunkData } from '../charts/lineHelpers'

const formatIssueData = (data:Issue[] = []):GraphIssue[] => data
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
    classes: Record<string, string>
}
const IssuesTrends = ({
    issues = [],
    releases = [],
    classes,
}:IssuesTrendsProps) => {
    const theme:Theme = useTheme();
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
                                    filterForKey: true,
                                    dataKey: 'issue',
                                    groupMath: 'count',
                                },
                                {
                                    label: 'Bugs*',
                                    color: colorB,
                                    filterForKey: true,
                                    dataKey: 'bug',
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

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = ():TagStyles => ({
    'fullP': {
        width: '100%',
        textAlign: 'center',
    },
})

type State = {
    issues: Issue[]
    releases: EventInfo[]
}
const mapStateToProps = (state:State) => ({
    issues: state.issues,
    releases: state.releases,
})

export default connect(mapStateToProps)(withStyles(styles)(IssuesTrends))
