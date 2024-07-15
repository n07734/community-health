import { apply, pathOr } from 'ramda'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMonths from 'date-fns/differenceInMonths'
import min from 'date-fns/min'
import max from 'date-fns/max'
import { ObjNumbers, PieData, PieInfo } from '../../types/Components'
import { EventInfo, PullRequest, ReleaseType } from '../../types/FormattedData'
import { UsersInfo } from '../../types/State'
import { LineDataKey, LineForGraph, LineInfo, LinePlot, GroupMathCalculation } from '../../types/Graphs'

import { batchBy } from './batchBy'
import { sumKeysValue, sortByKeys } from '../../utils'
import { colors } from '../colors'
import { Theme } from '@mui/material/styles'

const getAllYValues = (data: any[]) => {
    const allValues: number[] = []
    data
        .forEach(({ data }) => {
            const values = data
                .map((item: { y: number }) => item.y)

            allValues.push(...values)
        })

    return allValues.sort((a, b) => a - b)
}

const getMaxYValue = (data: any[]) => {
    const allValues = getAllYValues(data)

    const tp95Index = Math.round(allValues.length * 0.95)
    const tp95Value = allValues[tp95Index] || 0

    const maxValue = allValues.at(-1) || 0
    const percentOf = tp95Value && Math.round(((tp95Value / maxValue) * 100)) || 0

    // Use tp95Value if the values' % of total is low, this trims the top values off the graphs so the trends are more easy to see
    return tp95Value && percentOf < 30
        ? tp95Value
        : maxValue
}

const getMinYValue = (data: any[]) => {
    const allValues = getAllYValues(data)

    const minValue = allValues.length > 0
        ? apply(Math.min, allValues)
        : 0

    return minValue > 0
        ? 0
        : minValue
}

const dateSort = (
    { mergedAt: dateA = '' },
    { mergedAt: dateB = '' },
) => new Date(dateA).getTime() - new Date(dateB).getTime()

const formatDate = (date: string) => {
    const info = new Date(date)
    const month = info.getMonth() + 1
    const dayM = info.getDate()
    return `${info.getFullYear()}-${month < 10 ? `0${month}` : month}-${dayM < 10 ? `0${dayM}` : dayM}`
}

const averagePerDev = ({ filteredBatch = [] }: { filteredBatch: PullRequest[] }) => {
    const activeTeam: ObjNumbers = {}
    filteredBatch
        .forEach((pr) => activeTeam[pr.author] = 1)

    return Math.round(filteredBatch.length / Object.keys(activeTeam).length)
}

const trimmedAverage = ({ filteredBatch = [], dataKey }: { filteredBatch: PullRequest[], dataKey: LineDataKey }) => {
    const sortedBatch = filteredBatch
        .sort(sortByKeys([dataKey]))

    const batchLength = sortedBatch.length

    const trimmedValues = batchLength > 4
        ? sortedBatch
            .slice(Math.ceil(batchLength * 0.05), Math.floor(batchLength * 0.95))
        : sortedBatch

    const average = trimmedValues
        .reduce((acc, pr) => acc + (pr[dataKey] as number || 0), 0) / trimmedValues.length

    return Math.round(average)
}

const teamDistribution = ({ filteredBatch = [], dataKey }: { filteredBatch: PullRequest[], dataKey: LineDataKey }) => {
    // Distribution is only of active team members within the data
    const activeTeam = new Set<string>([])
    const batchedData: ObjNumbers = {}

    filteredBatch
        .forEach((pr) => {
            const {
                teamApprovers = {},
                teamCommenters = {},
            } = pr

            const data = /approvals/i.test(dataKey)
                ? teamApprovers
                : teamCommenters

            Object.entries(data)
                .forEach(([gitId, value]) => {
                    batchedData[gitId] = (batchedData[gitId] || 0) + (value as number)

                })

            const activeInPr = [
                ...(Object.keys(teamApprovers) || []),
                ...(Object.keys(teamCommenters) || []),
            ]
            activeInPr.length > 0 && activeInPr
                .map(user => activeTeam.add(user))
        })

    const zeroedTeam: ObjNumbers = {}
    activeTeam
        .forEach(x => zeroedTeam[x] = 0)

    const mergedData = {
        ...zeroedTeam,
        ...batchedData,
    }

    const values = Object.values(mergedData)
    const contributorCount = values.length

    const total = values.reduce((acc, value) => acc + value, 0)
    const average = total / contributorCount
    const max = (average * (contributorCount - 1)) + (total - average)
    const distance = values
        .reduce((acc, value) => acc + Math.abs(value - average), 0)
    const difference = max - distance
    const distributionPercent = Math.round((100 / max) * difference)

    return isNaN(distributionPercent)
        ? 0
        : distributionPercent
}

const percentWith = ({ filteredBatch = [], dataKey }: { filteredBatch: PullRequest[], dataKey: LineDataKey }) => {
    const batchLength = filteredBatch.length
    const withoutValues = filteredBatch
        .filter(x => !x[dataKey])

    const withoutValuesLength = withoutValues.length
    const percentageWithValues = withoutValuesLength > 0
        ? Math.round((batchLength - withoutValuesLength) / (batchLength) * 100)
        : 0

    return percentageWithValues;
}

const median = ({ filteredBatch, dataKey }: { filteredBatch: PullRequest[], dataKey: LineDataKey }) => {
    const batchLength = filteredBatch.length
    const sortedBatch = filteredBatch
        .sort(sortByKeys([dataKey]))
    return sortedBatch[Math.floor(batchLength / 2)][dataKey] as number || 0
}

const growth = ({ filteredBatch }: { filteredBatch: PullRequest[] }) => {
    const growth = filteredBatch
        .reduce((acc = 0, { additions = 0, deletions = 0 }) => (
            acc + (additions - deletions)
        ), 0)

    return growth
}

const formatBatches = ({ filterForKey = false, dataKey, groupMath = 'average' }: LineInfo) => (batches: any[] = []) => {
    const lineData: LinePlot[] = []
    batches
        .forEach((batch) => {
            const filteredBatch:any[] = batch
                .filter((x: any) => dataKey && filterForKey
                    ? /\d+/.test(x[dataKey])
                    : true,
                )

            const batchLength = filteredBatch.length

            if (!filterForKey || batchLength > 0) {
                const valueByTypes:GroupMathCalculation = {
                    average: () => {
                        const value = batchLength > 0
                            ? Math.round(sumKeysValue(dataKey)(filteredBatch) / batchLength)
                            : 0

                        return value
                    },
                    trimmedAverage,
                    sum: () => sumKeysValue(dataKey)(filteredBatch),
                    count: () => batchLength,
                    averagePerDev,
                    median,
                    percentWith,
                    teamDistribution,
                    growth,
                }

                lineData.push({
                    y: valueByTypes[groupMath]({ filteredBatch, dataKey }),
                    x: formatDate(batch[0].mergedAt),
                })
            }
        })

    return lineData
}

const formatUnbatchedData = ({ lines = [], data }: { lines: LineInfo[], data: PullRequest[] }) => {
    const formattedLines: LineForGraph[] = []
    lines
        .forEach((line) => {
            const { label, color, dataKey, data: lineData } = line

            const formattedData:LinePlot[] = (data || lineData)
                .map((pr) => {
                    const valueA = (pr[dataKey as LineDataKey] || 0) as number
                    // const valueB = pr.comments || 0
                    return {
                        // x: valueA,
                        // y: valueB,
                        y: valueA,
                        x: formatDate(pr.mergedAt),
                    }
                })

            if (formattedData.length) {
                formattedLines.push({
                    id: label,
                    color,
                    data: formattedData,
                })
            }
        })

    return formattedLines
}

const formatLinesData = ({ lines = [], data }: { lines: LineInfo[], data: any[] }) => {
    const sharedAxisData = data
        ? batchBy(data)
        : []

    const formatedLines:LineForGraph[] = []
    lines
        .forEach((line:LineInfo) => {
            const { label, color, data: lineData } = line
            const batchedData = lineData && lineData.length > 0
                ? batchBy(lineData)
                : sharedAxisData

            const formattedData = formatBatches(line)(batchedData)

            if (formattedData.length) {
                formatedLines.push({
                    id: label,
                    color,
                    data: formattedData,
                })
            }
        })

    return formatedLines
}

const formatGraphMarkers = (markers: EventInfo[], theme: Theme, lineData: LineForGraph[]) => {
    let dateStart: Date
    let dateEnd: Date
    lineData
        .forEach(({ data = [] }) => {
            const currentStart = data[0].x
            const currentEnd = data[data.length - 1].x

            if (!dateStart || new Date(currentStart) < dateStart) {
                dateStart = new Date(currentStart)
            }

            if (!dateEnd || new Date(currentEnd) > dateEnd) {
                dateEnd = new Date(currentEnd)
            }
        })

    const markerTypeMap = {
        MAJOR: 'primary',
        MINOR: 'secondary',
        PATCH: 'tertiary',
    }

    // colorList[i % colorList.length]
    const offsetSteps = [0, 18, 36, 54, 72, 90]

    const formattedMarkers = markers
        .filter(({ date }) => {
            const currentDate = new Date(date)

            return currentDate > dateStart && currentDate < dateEnd
        })
        .map((item: EventInfo, i: number) => ({
            axis: 'x',
            value: new Date(item.date).getTime(),
            legend: item.description,
            ...(theme.charts.markers[markerTypeMap[item.releaseType as ReleaseType] as 'primary' | 'secondary' | 'tertiary'] || {}),
            legendOffsetY: offsetSteps[i % offsetSteps.length],
        }))

    return formattedMarkers
}

const smoothNumber = (ruffledNumber: number) => {
    const stringNumber = `${ruffledNumber}`
    const roundTo = Math.ceil(stringNumber.length * 0.4)

    const [backwards] = stringNumber
        .split('')
        .reduceRight(([acc = [], increment = false]: [number[], boolean], item: string, index: number): [number[], boolean] => {
            var number = parseInt(item)

            const updatedItem = increment
                ? number + 1
                : number


            const round = index !== 0 && (updatedItem > 9 || (index > roundTo && updatedItem > 4))

            const newValue = round || index > roundTo
                ? 0
                : updatedItem

            return [
                [
                    ...acc,
                    newValue,
                ],
                round,
            ]
        }, [[], false])

    const smooth = backwards.reverse().join('')

    return smooth
}

const chunkData = (data: any[] = []) => {
    // This batches up the data the same way as the points on the line graph
    // doing this means the items in each table section matches the lines on the graph better.
    const batchedData = batchBy(data)
    const firstBatch = batchedData.at(0) || []
    const lastBatch = batchedData.at(-1) || []

    const startDate = firstBatch.at(0) && new Date(firstBatch.at(0)?.mergedAt)
    const endDate = lastBatch.at(0) && new Date(lastBatch.at(0)?.mergedAt)

    const totalDays = startDate && endDate
        ? differenceInDays(endDate, startDate)
        : 0

    const chunkyData: PullRequest[][] = []
    batchedData
        .forEach((items: any[] = [], i: number) => {
            const chunkCount = chunkyData.length
            // Need to add id for table component
            const tableItems = items
                .map((item = {}, j) => ({
                    ...item,
                    id: `${i}-${j}`,
                }))

            const prDate = new Date(tableItems.at(0).mergedAt)

            const daysFromStart = differenceInDays(prDate, startDate)

            const percentToEndDate = Math.floor((daysFromStart / totalDays) * 100)
            const percentChunked = 10 * chunkCount

            chunkCount < 1 || (percentToEndDate >= percentChunked && chunkCount < 10)
                ? chunkyData.push(tableItems)
                : (chunkyData.at(-1) as any[]).push(...tableItems)
        })

    return chunkyData
}

const getData = pathOr([{}], ['data'])

const getFirstLastDates = (lines:LineForGraph[] = []) => {
    const dates: Date[] = []
    lines
        .forEach(x => {
            const data = getData(x) as any[]
            dates.push(new Date(data.at(0).x))
            dates.push(new Date(data.at(-1).x))
        })

    return dates
}

const getReportMonthCount = (leftItems:LineForGraph[] = [], rightItems:LineForGraph[] = []) => {
    const allDates = getFirstLastDates([...leftItems, ...rightItems])

    const startDate = min(allDates)
    const endDate = max(allDates)

    const totalMonths = differenceInMonths(endDate, startDate)

    return totalMonths
}

type SplitByAuthor = {
    pullRequests?: PullRequest[]
    showNames?: boolean
    usersInfo?: UsersInfo
}
const splitByAuthor = ({ pullRequests = [], showNames = true, usersInfo = {} }: SplitByAuthor) => {
    const authorsPrs: { [key: string]: PullRequest[] } = {}
    pullRequests
        .forEach((pr) => {
            const { author } = pr
            const theirPrs = authorsPrs[author] || []
            theirPrs.push(pr)
            authorsPrs[author] = theirPrs
        })

    const byAuthorLines = Object.entries(authorsPrs)
        .map(([author = '', prs = []], i) => {
            const data = prs
                .map(pr => ({
                    value: 1,
                    mergedAt: pr.mergedAt,
                }))

            return {
                label: showNames
                    ? usersInfo[author]?.name || author
                    : `${Array(i).fill(' ').join('')}Spartacus`,
                color: colors[i % colors.length],
                dataKey: 'value',
                groupMath: 'count',
                data,
            }
        })

    const byAuthor = {
        lines: byAuthorLines,
        xAxis: 'left',
    }

    return [byAuthor]
}
type RainbowType = 'repo' | 'org'
const rainbowData = (type:RainbowType = 'repo', data:ObjNumbers = {}) => {
    const sortedData = Object.entries(data)
        .sort(([, a], [, b]) => a - b)

    const topItems = sortedData.slice(-20)

    const reportItems = sortedData.length > 19
        ? topItems.map(([item]) => item)
        : Object.keys(data)


    const pieData:PieData[] = topItems
        .map(([item, value], i) => ({
            id: item,
            label: item,
            color: colors[i % colors.length],
            value: value,
        }))

    const sectionTitle = sortedData.length > reportItems.length
        ? `PR rainbow split by top 20 ${type}s out of ${sortedData.length}`
        : `PR ${type} rainbow (${reportItems.length})`


    const pieInfo:PieInfo = {
        pieData,
        reportItems,
        pieTitle: `PR by ${type} rainbow`,
        sectionTitle,
    }

    return pieInfo
}

export {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatUnbatchedData,
    formatBatches,
    formatGraphMarkers,
    smoothNumber,
    dateSort,
    chunkData,
    sumKeysValue,
    getReportMonthCount,
    splitByAuthor,
    rainbowData,
}