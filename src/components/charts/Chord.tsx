
import { ResponsiveChord as NivoChord } from '@nivo/chord'

import { AnyForLib, UserData, UserDataByUserKeys } from '@/types/State'
import { useTheme } from "@/components/ThemeProvider"
import { chartStyles } from '@/components/charts/chartStyles'
import { colors } from '@/components/colors'
import { useShowNumbers } from '@/state/ShowNumbersProvider'
import { useShowNames } from '@/state/ShowNamesProvider'
import ChartHeading from './ChartHeading'
import formatChordData from '@/format/chordData'

type ChordProps = {
    title: string
    data: UserData[]
    preSorted: boolean
    dataKey: UserDataByUserKeys
}
const Chord = ({
    title,
    data = [],
    preSorted = false,
    dataKey,
}:ChordProps) => {
    const { theme } = useTheme()
    const styles = chartStyles(theme)

    const { showNumbers } = useShowNumbers()
    const { showNames } = useShowNames()

    const {
        names,
        matrix,
    } = formatChordData({data, dataKey, preSorted, showNames})

    const hasMatrixData = (matrix:number[][]) => matrix
        .some(row => row
            .some(Boolean),
        )

    return hasMatrixData(matrix) && (
        <div>
            <ChartHeading text={title} className="text-center" />
            <div className="chord-wrap">
                <NivoChord
                    label="id"
                    data={matrix}
                    keys={names}
                    margin={{ top: 0, right: 10, bottom: 10, left: 10 }}
                    arcBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                    ribbonOpacity={0.5}
                    ribbonBorderWidth={0.5}
                    ribbonBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                    innerRadiusRatio={0.85}
                    labelRotation={0}
                    padAngle={0.06}
                    innerRadiusOffset={0.03}
                    labelOffset={-23}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    colors={colors}
                    isInteractive={showNumbers}
                    activeArcOpacity={1}
                    inactiveArcOpacity={1}
                    activeRibbonOpacity={0.75}
                    inactiveRibbonOpacity={0.25}
                    animate={false}
                    motionConfig="stiff"
                    theme={styles as AnyForLib}
                />
            </div>
        </div>
    )
}

export default Chord