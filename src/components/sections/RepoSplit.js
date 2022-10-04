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


const rainbowData = (type = '', data = {}) => {
    const sortedData = Object.entries(data)
        .sort(([,a],[,b]) => a - b)

    const topItems = sortedData.slice(-20)

    const reportItems = sortedData.length > 19
        ? topItems.map(([item]) => item)
        : Object.keys(data)

    const pieData = topItems
        .map(([item, value], i) => ({
            id: item,
            label: item,
            color: colors[i % colors.length],
            value: value,
        }))

    const sectionTitle = sortedData.length > reportItems.length
        ? `PR total from top 20 ${type}s out of ${sortedData.length}`
        : `PR total from ${type}s (${reportItems.length})`

    return {
        pieData,
        reportItems,
        pieTitle: `PR by ${type} rainbow`,
        sectionTitle,
    }
}

const RepoSplit = ({
    pullRequests = [],
} = {}) => {
    const theme = useTheme();

    const allRepos = {}
    const allOrgs = {}
    const allPRdata = pullRequests.map(prData => {
        allRepos[prData.repo] = (allRepos[prData.repo] || 0) + 1
        allOrgs[prData.org] = (allOrgs[prData.org] || 0) + 1
        return ({
            ...prData,
            [`repo-${prData.repo}`]: 1,
        })
    })

    const repoPie = rainbowData('repo', allRepos)
    const uniqueRepos = repoPie.reportItems

    const filteredPRData = allPRdata
        .filter(({ repo = ''} = {}) => includes(repo, uniqueRepos))

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

    const orgPie = rainbowData('org', allOrgs)

    return filteredPRData.length > 0 && (<>
        <Paper>
            <ChartDescription title={repoPie.sectionTitle} />
            <Pie
                data={repoPie.pieData}
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
            <ChartDescription title={orgPie.sectionTitle} />
            <Pie
                data={orgPie.pieData}
                title="PR Orgs rainbow"
            />
        </Paper>
    </>)
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(RepoSplit)
