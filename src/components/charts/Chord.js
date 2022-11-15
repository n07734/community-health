import React from 'react'
import { ResponsiveChord as NivoChord } from '@nivo/chord'
import { useTheme } from '@material-ui/core/styles';

import ChartHeading from './ChartHeading'
import formatChordData from '../../format/chordData'
import styledCharts from './styledCharts'
import { colors } from '../colors'

const Chord = styledCharts(({
    title,
    data = [],
    preSorted = false,
    hideNames = false,
    dataKey = '',
    classes,
} = {}) => {
    const theme = useTheme();
    const {
        names,
        matrix,
    } = formatChordData(data, dataKey, preSorted, hideNames)

    const hasMatrixData = (matrix) => matrix
        .some(row => row
            .some(Boolean)
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
                    isInteractive={true}
                    arcHoverOpacity={1}
                    arcHoverOthersOpacity={0.25}
                    ribbonHoverOpacity={0.75}
                    ribbonHoverOthersOpacity={0.25}
                    animate={false}
                    motionStiffness={90}
                    motionDamping={7}
                    theme={theme.charts}
                />
            </div>
        </div>
    )
})

export default Chord