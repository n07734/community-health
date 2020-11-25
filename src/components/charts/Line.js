import React from 'react'
import _get from 'lodash/get'
import { ResponsiveLine as NivoLine } from '@nivo/line'
import { TableTooltip } from '@nivo/tooltip'

import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'

import {
    getMaxYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
} from './lineHelpers'

const ToolTip = convertedRightLines => data => {
    // NOTE: this is needed to use the original Y value for the tool tip
    const getYValue = (point) => {
        const label = point.serieId
        const xCurrentValue = point.data.xFormatted
        const yCurrentValue = point.data.yFormatted

        const { data: rightLineMatch = [] } = convertedRightLines
            .find(x => x.id === label) || {}

        const rightItemMatch = rightLineMatch
            .find(({ x, y }) => x === xCurrentValue && y === yCurrentValue)

        const updatedY = rightItemMatch
            ? rightItemMatch.originalY
            : yCurrentValue

        return updatedY
    }

    const Chip = ({ color }) => <span
        style={{
            display: 'block',
            width: '12px',
            height: '12px',
            background: color,
        }}
    />

    const points = _get(data, 'slice.points', [])
    return (
        <TableTooltip
            rows={
                points
                    .map((point) => [
                        <Chip color={point.serieColor} />,
                        point.serieId,
                        <strong>{getYValue(point)}</strong>,
                    ])
            }
        />
    )
}

const Line = styledCharts(({
    title,
    data = [],
    markers = [],
    classes,
    theme,
} = {}) => {
    // TODO: function to see time gap in data to help format date e.g. should add year
    const leftAxis = data
        .find(({ xAxis } = {}) => xAxis === 'left') || { data: [], lines: [] }
    const leftLinesData = formatLinesData(leftAxis)
    const maxLeftValue = getMaxYValue(leftLinesData)

    const rightAxis = data
        .find(({ xAxis } = {}) => xAxis === 'right') || { data: [], lines: [] }
    const rightLinesData = formatLinesData(rightAxis)
    const maxRightValue = getMaxYValue(rightLinesData)

    // As Nivo Line does not have right axis lines need to convert right line data to left line data
    const convertedRightLines = rightLinesData
        .map((item = {}) => {
            const formattedData = item.data
                .map((dataItem) => ({
                    y: Math.round(dataItem.y * (maxLeftValue / maxRightValue)),
                    x: dataItem.x,
                    originalY: dataItem.y,
                }))

            return formattedData.length && ({
                ...item,
                data: formattedData,
            })
        })
        .filter(Boolean)

    const leftHeadingItems = title
        ? [title]
        : leftAxis.lines

    const rightHeadingItems = rightAxis.lines

    const lineData = leftLinesData.concat(convertedRightLines)

    const formattedMarkers = formatGraphMarkers(markers, theme, lineData)

    const hasData = (items) => items.some(x => _get(x, 'data', []).length)

    return hasData(lineData) && (
        <div className={classes.chartComponentWrap}>
            <div className={classes.headingWrap}>
                <ChartHeading items={leftHeadingItems} />
                {
                    rightHeadingItems
                    && <ChartHeading items={rightHeadingItems} />
                }
            </div>

            <div className={classes.chartWrap}>
                <NivoLine
                    margin={{ top: 14, right: 50, bottom: 50, left: 50 }}
                    data={lineData}
                    colors={[
                        ...leftAxis.lines.map(x => x.color),
                        ...rightAxis.lines.map(x => x.color),
                    ]}
                    curve='monotoneX'
                    animate={false}
                    xScale={{
                        type: 'time',
                        format: '%Y-%m-%d',
                    }}
                    xFormat="time:%Y-%m-%d"
                    yScale={{
                        type: 'linear',
                        min: 0,
                        max: maxLeftValue,
                    }}
                    axisBottom={{
                        format: '%b %d',
                        tickSize: 0,
                        tickPadding: 10,

                    }}
                    axisLeft={{
                        tickSize: 0,
                        tickValues: 8,
                    }}
                    {...(
                        formattedMarkers.length
                            && { markers: formattedMarkers }

                    )}
                    {...(
                        convertedRightLines.length
                            && {
                                axisRight: {
                                    tickSize: 0,
                                    tickValues: 8,
                                    format: (rawLeftValue) => {
                                        const realRightValue = Math.round(rawLeftValue * (maxRightValue / maxLeftValue))
                                        return smoothNumber(realRightValue)
                                    },
                                },
                            }
                    )}
                    enableGridX={false}
                    enableSlices="x"
                    sliceTooltip={ToolTip(convertedRightLines)}
                    theme={theme.charts}
                />
            </div>
        </div>
    )
})

export default Line