import React from 'react'

import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import { P, UL, LI } from '../shared/StyledTags'

import Line from '../charts/Line'

const PullRequestTrends = ({
    pullRequests = [],
    releases = [],
} = {}) => (
    <Paper>
        <ChartDescription
            title="Pull Request trend data"
            intro='This section shows contribution trends over time and how releases impact them.'
        >
            <div>
                <P>Here are some things to look out for.</P>
                <UL>
                    <LI>Are there any/enough comments? It may be a sign that the code is not getting properly reviewed if there are not many comments.</LI>
                    <LI>Are all PRs are being approved? If not then how do you know they are getting properly reviewed?</LI>
                    <LI>Are there many large PRs? Generally the bigger the PR the lower the quality of the review will.</LI>
                    <LI>Do Comment and PR size lines follow a similar pattern? If not then some PRs may not be getting reviewed equally.</LI>
                    <LI>Do the PR age and size lines have a similar pattern? If not then maybe there are some large PRs that got approved with insufficient reviews.</LI>
                    <LI>How are the trends changing during a feature lifecycle?</LI>
                    <LI>What are the outliers and why?</LI>
                    <LI>What are the addition and deletion trends?</LI>
                </UL>
                <P>These are general questions meant to help teams find useful data and promote healthy discussions around their contributions. Team context is needed to have a clear understanding of the data.</P>
            </div>
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
                            color: '#e2e2e2',
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
                            color: '#e2e2e2',
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
                            label: 'Additions',
                            color: 'green',
                            dataKey: 'additions',
                        },
                        {
                            label: 'Deletions',
                            color: 'red',
                            dataKey: 'deletions',
                        },
                    ],
                    xAxis: 'left',
                    data: pullRequests,
                },
            ]}
        />
    </Paper>
)

export default PullRequestTrends