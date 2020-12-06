import React from 'react'
import { filter } from 'ramda'
import { ResponsiveBar as NivoBar } from '@nivo/bar'

import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'

const Bar = styledCharts(({
    data = [],
    bars = [],
    sortBy = 'comments',
    indexBy = 'user',
    max = 20,
    classes,
    theme,
} = {}) => {
    const trimmedData = filter(item => bars.some(x => item[x.dataKey]), data)


    const byPropDesc = prop => (a, b) =>
        +(a[prop] < b[prop]) || +(a[prop] === b[prop]) - 1

    const sortedData = sortBy
        ? trimmedData.sort(byPropDesc(sortBy))
        : trimmedData


    const finalData = max
        ? sortedData.slice(0, max - 1)
        : sortedData

    const keys = bars.map(x => x.dataKey)

    return hasChartData(data)(keys) && (
        <div className={classes.chartComponentWrap}>
            <ChartHeading items={bars} />
            <div className={classes.chartWrap}>
                <NivoBar
                    data={finalData}
                    keys={keys}
                    indexBy={indexBy}
                    margin={{ top: 5, right: 50, bottom: 60, left: 50 }}
                    padding={0.3}
                    groupMode="grouped"
                    colors={bars.map(x => x.color)}
                    axisBottom={{
                        tickSize: 0,
                        tickRotation: -45,
                    }}
                    axisLeft={{
                        tickSize: 0,
                    }}
                    enableLabel={false}
                    animate={false}
                    theme={theme.charts}
                />
            </div>
        </div>
    )
})

export default Bar