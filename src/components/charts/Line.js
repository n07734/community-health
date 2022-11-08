import React from 'react'
import { pathOr, propOr } from 'ramda'
import { ResponsiveLine as NivoLine } from '@nivo/line'
import { TableTooltip } from '@nivo/tooltip'
import { useTheme } from '@material-ui/core/styles';

import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'

import {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
    getReportMonthCount,
} from './lineHelpers'

const ToolTip = convertedRightLines => data => {
    // NOTE: this is needed to use the original Y value for the tool tip
    const getYValue = (point) => {
        const yCurrentValue = point.data.yFormatted
        const originalY = point.data.originalY

        return /[\d.]/.test(originalY)
            ? originalY
            : yCurrentValue
    }

    const Chip = ({ color }) => <span
        style={{
            display: 'block',
            width: '12px',
            height: '12px',
            background: color,
        }}
    />

    const points = pathOr([], ['slice', 'points'], data)
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
    blockHeading = false,
    data = [],
    markers = [],
    showLegends = false,
    legends = [],
    classes,
} = {}) => {
    const theme = useTheme();
    // TODO: function to see time gap in data to help format date e.g. should add year
    const leftAxis = data
        .find(({ xAxis } = {}) => xAxis === 'left') || { data: [], lines: [] }
    const leftLinesData = formatLinesData(leftAxis)
    const minLeftValue = getMinYValue(leftLinesData)

    const rightAxis = data
        .find(({ xAxis } = {}) => xAxis === 'right') || { data: [], lines: [] }
    const rightLinesData = formatLinesData(rightAxis)
    const maxRightValue = getMaxYValue(rightLinesData)
    const minRightValue = getMinYValue(rightLinesData)

    // if no left try right mas as there may be a right line being used
    const maxLeftValue = getMaxYValue(leftLinesData) || maxRightValue

    const minValue = minLeftValue > minRightValue
        ? minRightValue
        : minLeftValue

    // As Nivo Line does not have right axis lines need to convert right line data to left line data
    const convertedRightLines = rightLinesData
        .map((item = {}) => {
            const formattedData = item.data
                .map((dataItem) => ({
                    y: dataItem.y < 0
                        ? dataItem.y
                        : Math.round(dataItem.y * (maxLeftValue / maxRightValue)),
                    x: dataItem.x,
                    originalY: dataItem.y,
                }))

            return formattedData.length && ({
                ...item,
                data: formattedData,
            })
        })
        .filter(Boolean)

    const leftHeadingItems = title || blockHeading
        ? []
        : leftAxis.lines

    const rightHeadingItems = rightAxis.lines

    const legendsArray = legends.length
        ? legends
        : [
            {
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: -10,
                translateY: 10,
                itemsSpacing: 0,
                itemDirection: 'right-to-left',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'square',
                symbolBorderColor: 'rgba(0, 0, 0, .9)',
                toggleSerie: true,
                itemTextColor: theme.palette.text.primary,
            },
        ]

    const lineData = leftLinesData.concat(convertedRightLines)

    const formattedMarkers = formatGraphMarkers(markers, theme, lineData)

    const hasData = (items) => items.some(x => propOr([], 'data', x).length)

    const monthCount = getReportMonthCount(leftLinesData, rightLinesData)

    const xFormat = monthCount > 90
        ? '%Y'
        : '%y/%m'

    const allLines = [
        ...leftAxis.lines,
        ...rightAxis.lines,
    ]

    const DashedLine = ({ series, lineGenerator, xScale, yScale }) => series
        .map((item = {}) => {
            const { id, data: lineData, color } = item
            const { lineStyles = { strokeWidth: 2 } } = allLines.find(x => x.label === id) || {}

            return (
                <path
                    key={id}
                    d={lineGenerator(
                        lineData.map(d => ({
                            x: xScale(d.data.x),
                            y: yScale(d.data.y),
                        }))
                    )}
                    fill="none"
                    stroke={color}
                    style={lineStyles}
                />
            )
        })

    return hasData(lineData) && (
        <div className={classes.lineChartComponentWrap}>
            <div className={classes.headingWrap}>
                <ChartHeading type='line' text={title} items={leftHeadingItems} />
                {
                    !blockHeading && rightHeadingItems.length > 0
                        && <ChartHeading type='line' items={rightHeadingItems} />
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
                    lineWidth={2}
                    curve='monotoneX'
                    animate={false}
                    toggleSerie={showLegends && true}
                    xScale={{
                        type: 'time',
                        format: '%Y-%m-%d',
                    }}
                    xFormat="time:%Y-%m-%d"
                    yScale={{
                        type: 'linear',
                        min: minValue,
                        max: maxLeftValue,
                    }}
                    axisBottom={{
                        format: xFormat,
                        tickSize: 0,
                        tickPadding: 10,
                        tickRotation: -45,
                    }}
                    legends={showLegends ? legendsArray : []}
                    axisLeft={{
                        tickSize: 0,
                        tickValues: 8,
                    }}
                    pointLabelYOffset={0}
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
                                    return rawLeftValue < 0 // to allow minus values, minus values are currently raw not aligned like positive numbers
                                        ? rawLeftValue
                                        : smoothNumber(realRightValue)
                                },
                            },
                        }
                    )}
                    enableGridX={false}
                    enableSlices="x"
                    sliceTooltip={ToolTip(convertedRightLines)}
                    theme={theme.charts}
                    layers={['grid', 'markers', 'areas', DashedLine, 'slices', 'points', 'axes', 'legends']}
                />
            </div>
        </div>
    )
})

export default Line
