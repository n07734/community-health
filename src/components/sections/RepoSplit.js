import React from 'react'
import ChartDescription from '../shared/ChartDescription'
import Line from '../charts/Line'
import Pie from '../charts/Pie'
import Paper from '../shared/Paper'
import ItemsTable from './ItemsTable'
import { colors } from '../colors'

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
    chunkyData = [],
    allRepos = {},
    allOrgs = {},
} = {}) => {
    const repoPie = rainbowData('repo', allRepos)
    const uniqueRepos = repoPie.reportItems

    const lines = uniqueRepos
        .map((repo, i) => ({
            label: repo,
            color: colors[i % colors.length],
            filterForKey: `repo-${repo}`,
            groupMath: 'count',
        }))

    const orgPie = rainbowData('org', allOrgs)

    return pullRequests.length > 0 && (<>
        <Paper>
            <ChartDescription title={repoPie.sectionTitle} />
            <Pie
                data={repoPie.pieData}
                title="PR repository rainbow"
            />
            <Line
                title="Repository PRs over time"
                showLegends={true}
                data={[
                    {
                        lines,
                        xAxis: 'left',
                        data: pullRequests,
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

export default RepoSplit
