
import { ResponsivePie } from '@nivo/pie'

import { useTheme } from "@/components/ThemeProvider"
import { chartStyles } from '@/components/charts/chartStyles'
import { PieData } from '@/types/Components';
import { useShowNumbers } from '@/state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import { AnyForLib } from '@/types/State';

type PieProps = {
    title: string
    data: PieData[]
}
const Pie = ({
    title = '',
    data = [],
}:PieProps) => {
    const { theme } = useTheme()
    const styles = chartStyles(theme)
    const { showNumbers } = useShowNumbers()

    return data.length && (
        <div className="z-10 w-full max-w-mw">
            <div className="flex flex-wrap justify-between">
                <ChartHeading type='line' text={title} />
            </div>

            <div className="pie-wrap">
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
                    arcLinkLabelsTextColor={styles.textColor}
                    theme={styles as AnyForLib}
                    isInteractive={showNumbers}
                />
            </div>
        </div>
    )
}

export default Pie