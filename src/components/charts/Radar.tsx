
import { Radar as NivoRadar } from '@nivo/radar'
import { TableTooltip, Chip } from '@nivo/tooltip'
import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'
import { AllowedColors, RadarData, RadarDataItem } from '../../types/Components'

// eslint-disable-next-line react/display-name
const radarSliceTooltip = (fullData:RadarDataItem[]) => ({ index, data }: any) => {
    const matched = fullData.find(x => x.area === index) as any
    const rows = data.map(({ id, color }:{ id:string, color:AllowedColors}) => [
        <Chip key={id} color={color} />,
        id,
        matched[`${id}Original`],
    ])

    return <TableTooltip title={<strong>{index}</strong>} rows={rows} />
}

type RadarProps = RadarData & {
    showTitle?: boolean
    colors?: string[]
    width?: number
    height?: number
    classes?: any
}
const Radar = styledCharts(({
    title = '',
    showTitle = true,
    data = [],
    keys = [],
    colors = [],
    width = 410,
    height = 300,
    classes,
}:RadarProps) => {
    const theme:Theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
    const radarColors = colors.length > 0 ? colors : [colorA, colorB]

    const { showNumbers } = useShowNumbers()

    return hasChartData<RadarDataItem>(data,keys) && (
        <div>
            {
                showTitle && <ChartHeading className={classes.centerHeading} items={[{ label: title, color: colorB }]} />
            }

            <NivoRadar
                width={width}
                height={height}
                margin={{ top: 0, bottom: 0, right: 100, left: 100 }}
                dotSize={8}
                dotBorderColor={theme.charts.dotColor}
                dotBorderWidth={2}
                colors={radarColors}
                gridShape="linear"
                enableDotLabel={false}
                gridLabelOffset={10}
                gridLevels={3}
                animate={false}
                indexBy='area'
                keys={keys}
                data={data}
                maxValue={100}
                theme={theme.charts as any}
                sliceTooltip={radarSliceTooltip(data)}
                isInteractive={showNumbers}
            />
        </div>
    )
})

export default Radar