import React from 'react'

import { P, UL, LI } from '../shared/StyledTags'
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
                title="Issues trend data"
                intro="This is to help show the issue trends"
            >
                <div>
                    <P>Bugs in this graph are issues that have a title or a label that contains the word bug</P>
                    <UL>
                        <LI>What happens when there is a new release?</LI>
                        <LI>Is the bug count raising? If so then why?</LI>
                    </UL>
                    <P>Again, these are general questions meant to help teams find useful data and promote healthy discussions around team contributions. Team context is needed to have a clear understanding of the data.</P>
                </div>
            </ChartDescription>
            <Line
                markers={releases}
                data={[
                    {
                        lines: [
                            {
                                label: 'Issues',
                                color: 'green',
                                dataKey: 'issue',
                                groupMath: 'count',
                            },
                            {
                                label: 'Bugs',
                                color: 'red',
                                dataKey: 'bug',
                                groupMath: 'count',
                            },
                        ],
                        xAxis: 'left',
                        data,
                    },
                ]}
            />
        </Paper>
    )
}

export default IssuesTrends