import { useState } from 'react'
import { ResponsiveLine as NivoLine } from '@nivo/line'
import { LegendProps } from '@nivo/legends'
import { TableTooltip } from '@nivo/tooltip'
import { useTheme } from "@/components/ThemeProvider"
import { chartStyles } from '@/components/charts/chartStyles'


import { Lines, LineInfo, LineForGraph, ColumnKeys, LinePlot, TableData, Graph } from '@/types/Graphs'
import { EventInfo } from '@/types/FormattedData'
import { AnyForLib } from '@/types/State'

import { useShowNumbers } from '@/state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import GraphUi from './GraphUi'

import { DataTables } from '../ui/DataTables'

import {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
    getReportMonthCount,
} from './lineHelpers'

type Point = {
    data: {
        x: string
        y: number
        yFormatted: string
        originalY: string
    }
    serieId: string
    serieColor: string
}

type ToolTipProps = { slice: { points: Point[] } }

const ToolTip = (data: ToolTipProps) => {
    // NOTE: this is needed to use the original Y value for the tool tip
    const getYValue = (point: Point) => {
        const yCurrentValue = point.data.yFormatted
        const originalY = point.data.originalY

        return /[\d.]/.test(originalY)
            ? originalY
            : yCurrentValue
    }

    const points = data?.slice?.points || []
    return (
        <TableTooltip
            rows={
                points
                    .map((point, i: number) => [
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

type DashedLine = {
    series: AnyForLib[]
    lineGenerator: (data: { x: number, y: number }[]) => string
    xScale: AnyForLib
    yScale: AnyForLib
}
const DashedLine = (allLines:LineInfo[] = []) => ({ series, lineGenerator, xScale, yScale }:DashedLine):AnyForLib => series
    .map((item = {}) => {
        const { id, data: lineData, color } = item
        const { lineStyles = { strokeWidth: 2 } } = allLines.find(x => x.label === id) || {}

        return (
            <path
                key={id}
                d={lineGenerator(
                    lineData.map((d:AnyForLib) => ({
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

const getAllYMax = (data:LineInfo[] = []) => data
    .filter(x => x.yMax)
    .map(x => x.yMax) as number[]

const sortDesc = (a:number, b:number) => b - a

type LineProps = {
    title?: string
    combineTitles?: boolean
    blockHeading?: boolean
    data: Lines[]
    markers?: EventInfo[]
    showLegends?: boolean
    tableData?: TableData[][]
    tableKeys?: ColumnKeys[]
    graphInfo?: Graph
    setGraph?: (graphs: Graph[]) => void
    graphs?: Graph[]
    tableOpenedByDefault?: boolean
}
const Line = ({
    title,
    combineTitles = false,
    blockHeading = false,
    data = [],
    markers = [],
    showLegends = false,
    tableData = [],
    tableKeys = [],
    graphInfo,
    setGraph = () => {},
    graphs = [],
    tableOpenedByDefault = false,
}:LineProps = {} as LineProps) => {
    const { theme } = useTheme()
    const styles = chartStyles(theme)

    const { showNumbers } = useShowNumbers()
    // TODO: function to see time gap in data to help format date e.g. should add year
    const leftAxis = data
        .find(({ xAxis }) => xAxis === 'left') || { data: [], lines: [], xAxis: 'left' }
    const allLeftLineMaxYs = getAllYMax(leftAxis.lines)

    const leftLinesData = formatLinesData(leftAxis)

    const [maxLeftLineValue] = [...allLeftLineMaxYs, getMaxYValue(leftLinesData)].sort(sortDesc)
    const minLeftValue = getMinYValue(leftLinesData)

    const rightAxis = data
        .find(({ xAxis }) => xAxis === 'right') || { data: [], lines: [], xAxis: 'right'}

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
    const convertedRightLines:LineForGraph[] = []
    rightLinesData
        .forEach((item) => {
            const formattedData = item.data
                .map((dataItem:LinePlot) => ({
                    y: dataItem.y < 0
                        ? dataItem.y
                        : Math.round(dataItem.y * (maxLeftValue / maxRightValue)),
                    x: dataItem.x,
                    originalY: dataItem.y,
                }))

            if (formattedData.length) {
                convertedRightLines.push({
                    ...item,
                    data: formattedData,
                })
            }
        })

    const leftLines = leftAxis.lines

    const leftHeadingItems = !combineTitles && title || blockHeading
        ? []
        : leftLines

    const rightHeadingItems = rightAxis.lines

    const allLines = [
        ...leftAxis.lines,
        ...rightAxis.lines,
    ]

    type ColorsInfo = {
        label: string
        default: string
        current: string
        clicked: boolean
        color?: string
    }
    const colorsInfo:ColorsInfo[] = allLines.map(x => ({
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

    const enter = (data:{ label?: string } = {}) => {
        const itemsIndex = colorsInfo.findIndex(x => x.label === data.label)
        setState(hookedColors.map((info, i: number) => ({
            ...info,
            current: i === itemsIndex || info.clicked
                ? info.default
                : fadeColor,
        })))
    }

    const exit = () => {
        const hasClicked = hookedColors.some(x => x.clicked)
        setState(hookedColors.map((info) => ({
            ...info,
            current: (hasClicked && info.clicked || !hasClicked)
                ? info.default
                : fadeColor,
        })))
    }

    const click = (data: { label?: string} = {}) => {
        const itemsIndex = colorsInfo.findIndex(x => x.label === data.label)
        const updated = hookedColors
            .map((info, i:number) => {
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
        itemTextColor: styles.textColor,
    }

    const legends = []

    // If single axis and total and over x lines, then split, just for left lines
    if (rightAxis.lines.length < 1 && leftLines.length > 10) {
        type Info = {
            label: string
            color: string
        }
        const leftData:Info[] = []
        const rightData:Info[] = []
        const splitIndex = Math.ceil(leftLines.length / 2)
        leftLines
            .forEach(({ label, color }, i) => {
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

    const legendsArray = legends.length > 0
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

    const formattedMarkers = formatGraphMarkers(markers, styles, lineData)

    const hasData = (items:LineForGraph[]) => items.some(item => (item?.data || []).length)

    const monthCount = getReportMonthCount(leftLinesData, rightLinesData)

    const xFormat = monthCount > 90
        ? '%Y'
        : '%y/%m'

    return hasData(lineData) && (
        <div className="z-10 w-full max-w-mw">
            {
                graphInfo && graphs.length > 0 && <GraphUi
                    graphInfo={graphInfo as Graph}
                    setGraph={setGraph}
                    graphs={graphs}
                />
            }
            <div className="flex flex-wrap justify-between">
                <ChartHeading type='line' text={title} items={leftHeadingItems} />
                {
                    !blockHeading && rightHeadingItems.length > 0
                        && <ChartHeading type='line' items={rightHeadingItems} />
                }
            </div>

            <div className="chart-wrap">
                <NivoLine
                    margin={{ top: 14, right: 50, bottom: 50, left: 50 }}
                    data={lineData}
                    colors={hookedColors.map(x => x.current)}
                    lineWidth={2}
                    curve='monotoneX'
                    animate={false}
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
                    legends={(showLegends ? legendsArray : []) as LegendProps[]}
                    axisLeft={{
                        ...(!showNumbers && { renderTick: undefined }),
                        tickSize: 0,
                        tickValues: 8,
                    }}
                    pointLabelYOffset={0}
                    {...(
                        formattedMarkers.length
                        && { markers: formattedMarkers as AnyForLib }
                    )}
                    {...(
                        convertedRightLines.length
                        && {
                            axisRight: {
                                ...(!showNumbers && { renderTick: undefined }),
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
                    sliceTooltip={ToolTip as AnyForLib}
                    theme={styles as AnyForLib}
                    layers={['grid', 'markers', 'areas', DashedLine(allLines) as AnyForLib, 'slices', 'points', 'axes', 'legends']}
                />
            </div>
            {
                tableData.length > 0 && <DataTables
                    data={tableData}
                    dataKeys={tableKeys}
                    tableOpenedByDefault={tableOpenedByDefault}
                />
            }
        </div>
    )
}

export default Line
