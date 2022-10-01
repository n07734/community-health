import React from 'react'
import { connect } from 'react-redux'
import { includes, splitAt } from 'ramda'
import { useTheme } from '@material-ui/core/styles';

import ChartDescription from '../shared/ChartDescription'
import Line from '../charts/Line'
import Pie from '../charts/Pie'
import Paper from '../shared/Paper'
import ItemsTable from './ItemsTable'
import colors from '../colors'
import { chunkData } from '../charts/lineHelpers'


const RepoSplit = ({
    pullRequests = [],
} = {}) => {
    const theme = useTheme();

    const allRepos = {}
    const allPRdata = pullRequests.map(prData => {
        allRepos[prData.repo] =  (allRepos[prData.repo] || 0) + 1
        return ({
            ...prData,
            [`repo-${prData.repo}`]: 1,
        })
    })

    const sortedRepoData = Object.entries(allRepos)
        .sort(([,a],[,b]) => a - b)

    const topRepos = sortedRepoData.slice(-20)

    const uniqueRepos = sortedRepoData.length > 19
        ? topRepos.map(([repo]) => repo)
        : Object.keys(allRepos)

    const pieData = topRepos
        .map(([repo, value], i) => ({
            id: repo,
            label: repo,
            color: colors[i % colors.length],
            value: value,
        }))

    const filteredPRData = allPRdata
        .filter(({ repo = ''} = {}) => includes(repo, uniqueRepos))

    const sectionTitle = sortedRepoData.length > uniqueRepos.length
        ? `PRs split by top 20 of ${sortedRepoData.length} repositories`
        : `PRs split by repository (${uniqueRepos.length} repos)`

    const lines = uniqueRepos
        .map((repo, i) => ({
            label: repo,
            color: colors[i % colors.length],
            dataKey: `repo-${repo}`,
            groupMath: 'count',
        }))

    const [leftData, rightData] = lines.length > 10
        ? splitAt(Math.ceil(lines.length/2),lines)
        :[lines, []]

    const legends = [
        {
            data: leftData,
            anchor: 'top-left',
            direction: 'column',
            justify: false,
            translateX: 10,
            translateY: 10,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'square',
            symbolBorderColor: 'rgba(0, 0, 0, .9)',
            toggleSerie: true,
            itemTextColor: theme.palette.text.primary,
        },
        {
            data: rightData,
            anchor: 'top-right',
            direction: 'column',
            justify: false,
            translateX: -10,
            translateY: 10,
            itemsSpacing: 0,
            itemDirection: 'right-to-left',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'square',
            symbolBorderColor: 'rgba(0, 0, 0, .9)',
            toggleSerie: true,
            itemTextColor: theme.palette.text.primary,
        }
    ]

    const chunkyData = chunkData(pullRequests)

    return filteredPRData.length > 0 && (<>
        <Paper>
            <ChartDescription title={sectionTitle} />
            <Pie
                data={pieData}
                title="PR repository rainbow"
            />
            <Line
                title="Repository PRs over time"
                legends={legends}
                showLegends={true}
                data={[
                    {
                        lines,
                        xAxis: 'left',
                        data: filteredPRData,
                    },
                ]}
            />
            <ItemsTable
                dataKeys={['repo', 'author']}
                data={chunkyData}
            />
        </Paper>
    </>)
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(RepoSplit)
