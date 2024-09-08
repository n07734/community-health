
import { Radar as NivoRadar } from '@nivo/radar'
import { TableTooltip, Chip } from '@nivo/tooltip'

import { AllowedColors, RadarData, RadarDataItem } from '@/types/Components'
import { AnyForLib } from '@/types/State'
import { LineInfo } from '@/types/Graphs'

import { useTheme } from '@/components/ThemeProvider'
import { useShowNumbers } from '@/state/ShowNumbersProvider'

import { graphColors } from '@/components/colors'
import { chartStyles } from '@/components/charts/chartStyles'

import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'

// eslint-disable-next-line react/display-name
const radarSliceTooltip = (fullData:RadarDataItem[]) => ({ index, data }: AnyForLib) => {
    const matched = fullData.find(x => x.area === index) as AnyForLib
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
}
const Radar = styledCharts(({
    title = '',
    showTitle = true,
    data = [],
    keys = [],
    colors = [],
    width = 410,
    height = 300,
}:RadarProps) => {
    const { theme } = useTheme()
    const styles = chartStyles(theme)

    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const radarColors = colors.length > 0 ? colors : [colorA, colorB]

    const { showNumbers } = useShowNumbers()

    return hasChartData<RadarDataItem>(data,keys) && (
        <div>
            {
                showTitle && <ChartHeading
                    className="text-center"
                    items={[{ label: title, color: colorB }] as LineInfo[]}
                />
            }

            <NivoRadar
                width={width}
                height={height}
                margin={{ top: 0, bottom: 0, right: 100, left: 100 }}
                dotSize={8}
                dotBorderColor={styles.dotColor}
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
                theme={styles as AnyForLib}
                sliceTooltip={radarSliceTooltip(data)}
                isInteractive={showNumbers}
            />
        </div>
    )
})

export default Radar