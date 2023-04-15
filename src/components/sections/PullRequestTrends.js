import React from 'react'
import { connect } from 'react-redux'
import { useTheme } from '@material-ui/core/styles';

import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import { P } from '../shared/StyledTags'
import { colors } from '../colors'
import Line from '../charts/Line'

const getByAuthorData = (pullRequests = [], hideNames = false) => {
    const authorsPrs = {}
    pullRequests
        .forEach((pr) => {
            const { author } = pr
            const theirPrs = authorsPrs[author] || []
            theirPrs.push(pr)

            authorsPrs[author] = theirPrs
        })

    const byAuthorLines = Object.entries(authorsPrs)
        .map(([author = '', prs = []], i) => {
            const data = prs
                .map(pr => ({
                    value: 1,
                    mergedAt: pr.mergedAt,
                }))

            return {
                label: hideNames
                    ? `${Array(i).fill(' ').join('')}Spartacus`
                    : author,
                color: colors[i % colors.length],
                dataKey: 'value',
                groupMath: 'count',
                data,
            }
        })

    const byAuthor = {
        lines: byAuthorLines,
        xAxis: 'left',
    }

    return [byAuthor]
}

const PullRequestTrends = ({
    chunkyData = [],
    pullRequests = [],
    releases = [],
    userIds = [],
    hiddenNames = false,
} = {}) => {
    const { type } = useTheme();

    const isTeamPage = userIds.length > 0
    const byAuthorData = isTeamPage
        ? getByAuthorData(pullRequests, hiddenNames)
        : []

    return pullRequests.length > 0 && (
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
            <GraphsWrap>
                {
                    isTeamPage && <>
                        <Line
                            title="PRs by author"
                            markers={releases}
                            showLegends={true}
                            data={byAuthorData}
                            tableData={chunkyData}
                            tableKeys={['author', 'repo']}
                        />
                    </>
                }
                <Line
                    markers={releases}
                    data={[
                        {
                            lines: [
                                {
                                    label: 'PRs over time',
                                    color: '#1f77b4',
                                    dataKey: 'url',
                                    groupMath: 'count',
                                },
                            ],
                            xAxis: 'left',
                            data: pullRequests,
                        },
                    ]}
                    tableData={chunkyData}
                    tableKeys={['author']}
                />

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
                    tableData={chunkyData}
                    tableKeys={['comments', 'approvals', 'prSize', 'author']}
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
                    tableData={chunkyData}
                    tableKeys={['age', 'prSize', 'author']}
                />
            </GraphsWrap>
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
    userIds: state.fetches.userIds,
    hiddenNames: state.hiddenNames,
})

export default connect(mapStateToProps)(PullRequestTrends)
