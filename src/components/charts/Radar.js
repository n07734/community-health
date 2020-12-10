import React from 'react'
import { Radar as NivoRadar } from '@nivo/radar'
import { useTheme } from '@material-ui/core/styles';

import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'


const Radar = styledCharts(({
    title = '',
    titleItems = [],
    data = [],
    keys = [],
    width = 450,
    height = 310,
    classes,
} = {}) => {
    const theme = useTheme();
    const toolTipValues = data
        .reduce((acc, item) => acc.concat(
            keys
                .map(key => item[`${key}Original`])
        ), [])

    return hasChartData(data)(keys) && (
        <div>
            <ChartHeading className={classes.centerHeading} items={
                titleItems.length
                    ? titleItems
                    : [{ label: title }]
            } />
            <NivoRadar
                width={width}
                height={height}
                margin={{ top: 0, bottom: 0, right: 100, left: 100 }}
                dotSize={8}
                dotBorderColor={theme.charts.dotColor}
                dotBorderWidth={2}
                colors={['#1f77b4', '#e82573']}
                gridShape="linear"
                enableDotLabel={false}
                gridLabelOffset={10}
                gridLevels={3}
                animate={false}
                indexBy='area'
                keys={keys}
                data={data}
                maxValue={100}
                theme={theme.charts}
                gridAngleStep={200}
                angleStep={200}
                tooltipFormat={() => toolTipValues.shift()}
            />
        </div>
    )
})

export default Radar