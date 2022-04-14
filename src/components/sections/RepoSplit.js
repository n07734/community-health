import React from 'react'
import { connect } from 'react-redux'

import ChartDescription from '../shared/ChartDescription'
import Line from '../charts/Line'
import Pie from '../charts/Pie'
import Paper from '../shared/Paper'
import colors from '../colors'

const RepoSplit = ({
    pullRequests = [],
} = {}) => {
    const allRepos = {}
    const sentPRData = pullRequests.map(prData => {
        allRepos[prData.repo] =  (allRepos[prData.repo] || 0) + 1
        return ({
            ...prData,
            [`repo-${prData.repo}`]: 1,
        })
    })
    const uniqueRepos = Object.keys(allRepos)

    const pieData = Object.entries(allRepos)
        .sort(([,a],[,b]) => a - b)
        .map(([repo, value], i) => ({
            id: repo,
            label: repo,
            color: colors[i % colors.length],
            value: value,
        }))

    return (<>
        <Paper>
            <ChartDescription title="PRs split by repository" />
            <Pie
                data={pieData}
                title="PR repository pie"
            />
            <Line
                showLegends={true}
                title="Repository PRs over time"
                data={[
                    {
                        lines: uniqueRepos
                            .map((repo, i) => ({
                                label: repo,
                                color: colors[i % colors.length],
                                dataKey: `repo-${repo}`,
                                groupMath: 'count',
                            })),
                        xAxis: 'left',
                        data: sentPRData,
                    },
                ]}
            />
        </Paper>
    </>)
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(RepoSplit)
