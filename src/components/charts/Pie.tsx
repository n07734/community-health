
import { ResponsivePie } from '@nivo/pie'
import { useTheme } from '@mui/styles';
import { PieData } from '../../types/Components';
import { Theme } from '@mui/material/styles'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import { AnyForLib } from '../../types/State';

type PieProps = {
    title: string
    data: PieData[]
    classes: Record<string, string>
}
const Pie = styledCharts(({
    title = '',
    data = [],
    classes,
}:PieProps) => {
    const theme:Theme = useTheme();
    const { showNumbers } = useShowNumbers()

    return data.length && (
        <div className={classes.lineChartComponentWrap}>
            <div className={classes.headingWrap}>
                <ChartHeading type='line' text={title} />
            </div>

            <div className={classes.pieWrap}>
                <ResponsivePie
                    data={data}
                    colors={{ datum: 'data.color' }}
                    margin={{ top: 15, right: 80, bottom: 0, left: 80 }}
                    animate={false}
                    innerRadius={0.65}
                    padAngle={1}
                    cornerRadius={4}
                    activeOuterRadiusOffset={5}
                    borderWidth={1}
                    startAngle={-90}
                    endAngle={90}
                    enableArcLabels={false}
                    arcLinkLabelsSkipAngle={4}
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLinkLabelsDiagonalLength={10}
                    arcLinkLabelsStraightLength={15}
                    arcLinkLabelsTextColor={theme.palette.text.primary}
                    theme={theme.charts as AnyForLib}
                    isInteractive={showNumbers}
                />
            </div>
        </div>
    )
})

export default Pie