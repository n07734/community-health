
import { ResponsiveChord as NivoChord } from '@nivo/chord'
import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { AnyForLib, UserData, UserDataByUserKeys } from '../../types/State'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import { useShowNames } from '../../state/ShowNamesProvider'
import ChartHeading from './ChartHeading'
import formatChordData from '../../format/chordData'
import styledCharts from './styledCharts'

type ChordProps = {
    title: string
    data: UserData[]
    preSorted: boolean
    dataKey: UserDataByUserKeys
    classes: Record<string, string>
}
const Chord = styledCharts(({
    title,
    data = [],
    preSorted = false,
    dataKey,
    classes,
}:ChordProps) => {
    const theme:Theme = useTheme();
    const colors = theme.palette.colorList
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
            <ChartHeading text={title} className={classes.centerHeading} />
            <div className={classes.chordWrap}>
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
                    theme={theme.charts as AnyForLib}
                />
            </div>
        </div>
    )
})

export default Chord