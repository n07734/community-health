import { useState } from 'react'
import { pathOr, propOr } from 'ramda'
import { ResponsiveLine as NivoLine } from '@nivo/line'
import { TableTooltip } from '@nivo/tooltip'
import { useTheme } from '@mui/styles'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import ItemsTable from '../sections/ItemsTable'
import GraphUi from './GraphUi'

import {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
    getReportMonthCount,
} from './lineHelpers'

// eslint-disable-next-line react/display-name
const ToolTip = () => (data) => {
    // NOTE: this is needed to use the original Y value for the tool tip
    const getYValue = (point) => {
        const yCurrentValue = point.data.yFormatted
        const originalY = point.data.originalY

        return /[\d.]/.test(originalY)
            ? originalY
            : yCurrentValue
    }

    const points = pathOr([], ['slice', 'points'], data)
    return (
        <TableTooltip
            rows={
                points
                    .map((point, i) => [
                        <span
                            key={i}
                            style={{
                                display: 'block',
                                width: '12px',
                                height: '12px',
                                background: point.serieColor,
                            }}
                        ></span>,
                        point.serieId,
                        <strong key={i}>{getYValue(point)}</strong>,
                    ])
            }
        />
    )
}

const DashedLine = (colors, allLines = []) => ({ series, lineGenerator, xScale, yScale }) => series
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
                    })),
                )}
                fill="none"
                stroke={color}
                style={lineStyles}
            />
        )
    })

const getAllYMax = (data = []) => data
    .filter(x => x.yMax)
    .map(x => x.yMax)

const sortDesc = (a,b) => b - a

const Line = styledCharts(({
    title,
    combineTitles = false,
    blockHeading = false,
    data = [],
    markers = [],
    showLegends = false,
    legends = [],
    classes,
    tableData = [],
    tableKeys = [],
    graphInfo = {},
    setGraph = () => {},
    graphs = [],
    tableOpenedByDefault = false,
} = {}) => {
    const theme = useTheme();
    const { showNumbers } = useShowNumbers()
    // TODO: function to see time gap in data to help format date e.g. should add year
    const leftAxis = data
        .find(({ xAxis } = {}) => xAxis === 'left') || { data: [], lines: [] }
    const allLeftLineMaxYs = getAllYMax(leftAxis.lines)

    const leftLinesData = formatLinesData(leftAxis)
    const [maxLeftLineValue] = [...allLeftLineMaxYs, getMaxYValue(leftLinesData)].sort(sortDesc)
    const minLeftValue = getMinYValue(leftLinesData)

    const rightAxis = data
        .find(({ xAxis } = {}) => xAxis === 'right') || { data: [], lines: [] }

    const rightLineMaxYs = getAllYMax(rightAxis.lines)
    const rightLinesData = formatLinesData(rightAxis)
    const [maxRightValue] = [...rightLineMaxYs, getMaxYValue(rightLinesData)].sort(sortDesc)
    const minRightValue = getMinYValue(rightLinesData)

    // if no left try right mas as there may be a right line being used
    const maxLeftValue = maxLeftLineValue || maxRightValue

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

    const leftLines = leftAxis.lines

    const leftHeadingItems = !combineTitles && title || blockHeading
        ? []
        : leftLines

    const rightHeadingItems = rightAxis.lines

    const allLines = [
        ...leftAxis.lines,
        ...rightAxis.lines,
    ]

    const colorsInfo = allLines.map(x => ({
        label: x.label,
        default: x.color,
        current: x.color,
        clicked: false,
    }))

    const [ hookedColors = [], setState] = useState(colorsInfo)

    if ((colorsInfo.length !== hookedColors.length) || hookedColors.length === 1 && hookedColors[0].color !== colorsInfo[0].color) {
        setState(colorsInfo)
    }

    const fadeColor = 'rgba(120, 119, 120, 0.27)'

    const enter = (data = {}) => {
        const itemsIndex = colorsInfo.findIndex(x => x.label === data.label)
        setState(hookedColors.map((info = {}, i) => ({
            ...info,
            current: i === itemsIndex || info.clicked
                ? info.default
                : fadeColor,
        })))
    }

    const exit = () => {
        const hasClicked = hookedColors.some(x => x.clicked)
        setState(hookedColors.map((info = {}) => ({
            ...info,
            current: (hasClicked && info.clicked || !hasClicked)
                ? info.default
                : fadeColor,
        })))
    }

    const click = (data = {}) => {
        const itemsIndex = colorsInfo.findIndex(x => x.label === data.label)
        const updated = hookedColors
            .map((info = {}, i) => {
                const selectedClicked = i === itemsIndex && !info.clicked

                return ({
                    ...info,
                    current: selectedClicked || (i !== itemsIndex && info.clicked)
                        ? info.default
                        : fadeColor,
                    clicked: i === itemsIndex
                        ? selectedClicked
                        : info.clicked,
                })
            })
        setState(updated)
    }

    const defaultLegendInfo = {
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
        itemTextColor: theme.palette.text.primary,
    }

    // If single axis and total and over x lines, then split, just for left lines
    if (legends.length < 1 && rightAxis.lines < 1 && leftLines.length > 10) {
        const leftData = []
        const rightData = []
        const splitIndex = Math.ceil(leftLines.length / 2)
        leftLines
            .forEach(({ label, color } = {}, i) => {
                const { current } = hookedColors.find(x => x.label === label) || {}
                const item = {
                    label,
                    color: current || color,
                }
                if (i < splitIndex) {
                    leftData.push(item)
                } else {
                    rightData.push(item)
                }
            })

        legends.push(
            {
                ...defaultLegendInfo,
                data: leftData,
                anchor: 'top-left',
                direction: 'column',
                translateX: 10,
                itemDirection: 'left-to-right',
            },
            {
                ...defaultLegendInfo,
                data: rightData,
            },
        )
    }

    const legendsArray = legends.length
        ? legends
            .map((item) => ({
                ...item,
                onMouseEnter: enter,
                onMouseLeave: exit,
                onClick: click,
            }))
        : [{
            ...defaultLegendInfo,
            onMouseEnter: enter,
            onMouseLeave: exit,
            onClick: click,
        }]

    const lineData = leftLinesData.concat(convertedRightLines)

    const formattedMarkers = formatGraphMarkers(markers, theme, lineData)

    const hasData = (items) => items.some(x => propOr([], 'data', x).length)

    const monthCount = getReportMonthCount(leftLinesData, rightLinesData)

    const xFormat = monthCount > 90
        ? '%Y'
        : '%y/%m'

    return hasData(lineData) && (
        <div className={classes.lineChartComponentWrap}>
            {
                graphs.length > 0 && <GraphUi
                    graphInfo={graphInfo}
                    setGraph={setGraph}
                    graphs={graphs}
                />
            }
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
                    colors={hookedColors.map(x => x.current)}
                    lineWidth={2}
                    curve='monotoneX'
                    animate={false}
                    toggleSerie={false}
                    isInteractive={showNumbers}
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
                        ...(!showNumbers && { renderTick: () => null}),
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
                                ...(!showNumbers && { renderTick: () => null}),
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
                    layers={['grid', 'markers', 'areas', DashedLine(hookedColors, allLines), 'slices', 'points', 'axes', 'legends']}
                />
            </div>
            {
                  tableData.length > 0 && <ItemsTable
                    data={tableData}
                    dataKeys={tableKeys}
                    tableOpenedByDefault={tableOpenedByDefault}
                />
            }
        </div>
    )
})

export default Line
