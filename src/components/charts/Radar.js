import React from 'react'
import { Radar as NivoRadar } from '@nivo/radar'
import { TableTooltip, Chip } from '@nivo/tooltip'
import { useTheme } from '@material-ui/core/styles';

import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'

const radarSliceTooltip = fullData => ({ index, data }) => {
    const matched = fullData.find(x => x.area === index);
    const rows = data.map(({ id, color }) => [
        <Chip key={id} color={color} />,
        id,
        matched[`${id}Original`],
    ])

    return <TableTooltip title={<strong>{index}</strong>} rows={rows} />
}

const Radar = styledCharts(({
    title = '',
    titleItems = [],
    data = [],
    keys = [],
    width = 410,
    height = 300,
    classes,
} = {}) => {
    const theme = useTheme();

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
                sliceTooltip={radarSliceTooltip(data)}
            />
        </div>
    )
})

export default Radar