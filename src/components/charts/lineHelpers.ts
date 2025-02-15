import apply from 'ramda/es/apply'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMonths from 'date-fns/differenceInMonths'
import min from 'date-fns/min'
import max from 'date-fns/max'
import { PieData, PieInfo } from '../../types/Components'
import { EventInfo, Issue, PullRequest, ReleaseType } from '../../types/FormattedData'
import { KeysOfValue, UsersInfo } from '../../types/State'
import { TableData, AuthorItem, LineDataKeys, LineForGraph, LineInfo, Lines, LinePlot, LineData, IssueIssue, LineInfoAuthor } from '../../types/Graphs'

import { batchBy } from './batchBy'
import { sumKeysValue, sortByKeys } from '../../utils'
import { colors } from '../colors'

const getAllYValues = (data: LineForGraph[]) => {
    const allValues: number[] = []
    data
        .forEach(({ data }) => {
            const values = data
                .map((item: { y: number }) => item.y)

            allValues.push(...values)
        })

    return allValues.sort((a, b) => a - b)
}

const getMaxYValue = (data: LineForGraph[]) => {
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

const getMinYValue = (data: LineForGraph[]) => {
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

const averagePerDev = ({ batch = [] }: { batch: LineData[] }) => {
    const activeTeam:Record<string, number> = {}
    batch
        .forEach((pr) => 'prSize' in pr && (activeTeam[pr.author] = 1))

    return Math.round(batch.length / Object.keys(activeTeam).length)
}

const trimmedAverage = ({ batch = [], dataKey }: { batch: LineData[], dataKey: LineDataKeys }) => {
    const key = dataKey as KeysOfValue<LineData, number>
    const sortedBatch = batch
        .sort(sortByKeys([key]))

    const batchLength = sortedBatch.length

    const trimmedValues = batchLength > 4
        ? sortedBatch
            .slice(Math.ceil(batchLength * 0.05), Math.floor(batchLength * 0.95))
        : sortedBatch

    const average = trimmedValues
        .reduce((acc, pr) => acc + ((key && pr[key]) || 0), 0) / trimmedValues.length

    return Math.round(average)
}

const teamDistribution = ({ batch = [], dataKey = 'comments' }: { batch: LineData[], dataKey: LineDataKeys }) => {
    // Distribution is only of active team members within the data
    const activeTeam = new Set<string>([])
    const batchedData:Record<string, number> = {}

    batch
        .forEach((pr) => {
            if (!('prSize' in pr)) {
                return
            }

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

    const zeroedTeam:Record<string, number> = {}
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

const percentWith = ({ batch = [], dataKey = 'comments' }: { batch: LineData[], dataKey: LineDataKeys }) => {
    const batchLength = batch.length
    const withoutValues = batch
        .filter(x => !x[dataKey as keyof LineData])

    const withoutValuesLength = withoutValues.length
    const percentageWithValues = withoutValuesLength > 0
        ? Math.round((batchLength - withoutValuesLength) / (batchLength) * 100)
        : 0

    return percentageWithValues;
}

const median = ({ batch, dataKey }: { batch: LineData[], dataKey: LineDataKeys }) => {
    const batchLength = batch.length
    const sortedBatch = batch
        .sort(sortByKeys([dataKey as KeysOfValue<LineData, number>]))

    const position = Math.floor(batchLength / 2)
    const item = sortedBatch[position]
    return item[dataKey as KeysOfValue<LineData, number>] || 0
}

const growth = ({ batch }: { batch: LineData[] }) => {
    const growth = batch
        .reduce((acc = 0, item) => {
            if (!('prSize' in item)) {
                return acc
            }
            const { additions = 0, deletions = 0 } = item
            return acc + (additions - deletions)
        }, 0)

    return growth
}

const formatBatches = ({
    dataKey,
    groupMath = 'average',
}: LineInfo,
batches:LineData[][] = [],
) => {
    const lineData: LinePlot[] = []
    batches
        .forEach((batch) => {
            const batchLength = batch.length

            if (batchLength > 0) {
                const valueByTypes = {
                    average: () => {
                        const value = batchLength > 0
                            ? Math.round(sumKeysValue(dataKey)(batch) / batchLength)
                            : 0

                        return value
                    },
                    trimmedAverage,
                    sum: () => sumKeysValue(dataKey)(batch),
                    count: () => batchLength,
                    averagePerDev,
                    median,
                    percentWith,
                    teamDistribution,
                    growth,
                }

                lineData.push({
                    y: valueByTypes[groupMath]({ batch, dataKey }),
                    x: formatDate(batch[0].mergedAt),
                })
            }
        })

    return lineData
}

const formatUnbatchedData = ({ lines = [] }: Lines) => {
    const formattedLines: LineForGraph[] = []
    lines
        .forEach((line) => {
            const { label, color, dataKey, data: lineData = [] } = line

            const formattedData:LinePlot[] = lineData
                .map((item) => {
                    const valueA = (item[dataKey as keyof LineData] || 0) as number
                    // const valueB = pr.comments || 0
                    return {
                        // x: valueA,
                        // y: valueB,
                        y: valueA,
                        x: formatDate(item.mergedAt),
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


const formatLinesData = ({ lines = [] }: Lines) => {
    const formatedLines:LineForGraph[] = []
    lines
        .forEach((line) => {
            const { label, color, data: lineData } = line
            const batchedData = batchBy<PullRequest | IssueIssue>(lineData)

            const formattedData = formatBatches(line,batchedData)

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

type Styles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markers: Record<'primary' | 'secondary' | 'tertiary', any>
}

const formatGraphMarkers = (markers: EventInfo[], styles: Styles, lineData: LineForGraph[]) => {
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
        EVENT: 'primary',
    }

    // colorList[i % colorList.length]
    const offsetSteps = [0, 18, 36, 54, 72, 90]

    const formattedMarkers = markers
        .filter(({ date, releaseType }) => {
            const currentDate = new Date(date)

            return releaseType !== 'PATCH' && currentDate > dateStart && currentDate < dateEnd
        })
        .map((item: EventInfo, i: number) => ({
            axis: 'x',
            value: new Date(item.date).getTime(),
            legend: item.description,
            ...(styles.markers[markerTypeMap[item.releaseType as ReleaseType] as 'primary' | 'secondary' | 'tertiary'] || {}),
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
            const number = parseInt(item)

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

const chunkData = <T extends PullRequest | Issue>(data: T[] = []):TableData[][] => {
    // This batches up the data the same way as the points on the line graph
    // doing this means the items in each table section matches the lines on the graph better.
    const batchedData = batchBy(data)
    const firstBatch = batchedData.at(0) || []
    const lastBatch = batchedData.at(-1) || []

    const startDate = (firstBatch.at(0) && new Date(firstBatch.at(0)?.mergedAt || (firstBatch.at(0) as Issue)?.createdAt)) as Date
    const endDate = (lastBatch.at(0) && new Date(lastBatch.at(0)?.mergedAt || (lastBatch.at(0) as Issue)?.createdAt)) as Date

    const totalDays = startDate && endDate
        ? differenceInDays(endDate, startDate)
        : 0

    const chunkyData: TableData[][] = []
    batchedData
        .forEach((items: T[] = []) => {
            const chunkCount = chunkyData.length

            const prDate = new Date((items.at(0) as T || {}).mergedAt || (items.at(0) as Issue || {}).createdAt)

            const daysFromStart = differenceInDays(prDate, startDate)

            const percentToEndDate = Math.floor((daysFromStart / totalDays) * 100)
            const percentChunked = 10 * chunkCount

            chunkCount < 1 || (percentToEndDate >= percentChunked && chunkCount < 10)
                ? chunkyData.push(items)
                : (chunkyData.at(-1) as TableData[]).push(...items)
        })

    return chunkyData
}


const getFirstLastDates = (lines:LineForGraph[] = []) => {
    const dates: Date[] = []
    lines
        .forEach(({ data = [] }) => {
            dates.push(new Date((data.at(0) as LinePlot).x))
            dates.push(new Date((data.at(-1) as LinePlot).x))
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

    const byAuthorLines: LineInfoAuthor[] = Object.entries(authorsPrs)
        .map(([author = '', prs = []], i) => {
            const data:AuthorItem[] = prs
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

    const byAuthor:Lines = {
        lines: byAuthorLines,
        xAxis: 'left',
    }

    return [byAuthor]
}
type RainbowType = 'repo' | 'org'
const rainbowData = (type:RainbowType = 'repo', data:Record<string, number> = {}) => {
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
    getReportMonthCount,
    splitByAuthor,
    rainbowData,
}