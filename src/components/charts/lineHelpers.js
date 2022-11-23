import { apply, pathOr } from 'ramda'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMonths from 'date-fns/differenceInMonths'
import min from 'date-fns/min'
import max from 'date-fns/max'

import { batchBy } from './batchBy'
import { sumKeysValue, sortByKeys } from '../../utils'

const getAllYValues = data => {
    const allValues = []
    data
        .forEach(({ data }) => {
            const values = data
                .map(x => x.y)

            allValues.push(...values)
        })

    return allValues
}

const getMaxYValue = (data) => {
    const allValues = getAllYValues(data)

    const maxValue = allValues.length > 0
        ? apply(Math.max, allValues)
        : 0

    return maxValue
}

const getMinYValue = (data) => {
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

const formatDate = (date) => {
    const info = new Date(date)
    const month = info.getMonth() + 1
    const dayM = info.getDate()
    return `${info.getFullYear()}-${month < 10 ? `0${month}` : month}-${dayM < 10 ? `0${dayM}` : dayM}`
}

const formatBatches = ({ filterForKey = '', dataKey = '', groupMath = 'average' } = {}) => (batches = []) => {
    const lineData = []
    batches
        .forEach((batch) => {
            const filteredBatch = batch
                .filter(x => filterForKey
                    ? /\d+/.test(x[filterForKey])
                    : true
                )

            const key = dataKey || filterForKey
            const batchLength = filteredBatch.length

            if (!filterForKey || batchLength > 0) {
                const valueByTypes = {
                    'average': () => Math.round(sumKeysValue(key)(filteredBatch) / filteredBatch.length),
                    'sum': () => sumKeysValue(key)(filteredBatch),
                    'count': () => filteredBatch.length,
                    'mean': () => {
                        const sortedBatch = filteredBatch
                            .sort(sortByKeys([key]))
                        return sortedBatch[Math.floor(batchLength / 2)][key] || 0
                    }
                }

                lineData.push({
                    y: valueByTypes[groupMath](),
                    x: formatDate(batch[0].mergedAt),
                })
            }
        })

        return lineData
}

const formatLinesData = ({lines = [], data} = {}) => {
    const sharedAxisData = data
        ? batchBy('mergedAt')(data)
        : []

    const formatedLines = []
    lines
        .forEach((line = {}) => {
            const { label, color, data: lineData } = line
            const batchedData = lineData && lineData.length > 0
                ? batchBy('mergedAt')(lineData)
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

const formatGraphMarkers = (markers, theme, lineData) => {
    let dateStart
    let dateEnd
    lineData
        .forEach(({ data = [] } = {}) => {
            const currentStart = data[0].x
            const currentEnd = data[data.length - 1].x

            if (!dateStart || new Date(currentStart) < dateStart) {
                dateStart = new Date(currentStart)
            }

            if (!dateEnd || new Date(currentEnd) > dateEnd) {
                dateEnd = new Date(currentEnd)
            }
        })

    const markerType = (type) => ({
        MAJOR: 'primary',
        MINOR: 'secondary',
    })[type] || 'tertiary'

    const formattedMarkers = markers
        .filter(({ date } = {}) => {
            const currentDate = new Date(date)

            return currentDate > dateStart && currentDate < dateEnd
        })
        .map((item) => ({
            axis: 'x',
            value: new Date(item.date).getTime(),
            legend: item.releaseType === 'MAJOR'
                ? item.description
                : '',
            ...(theme.charts.markers[markerType(item.releaseType)] || {}),
        }))

    return formattedMarkers
}

const smoothNumber = (ruffledNumber) => {
    const stringNumber = `${ruffledNumber}`
    const roundTo = Math.ceil(stringNumber.length * 0.4)

    const [backwards] = stringNumber
        .split('')
        .reduceRight(([acc = '', increment = false], item, index) => {
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
        }, [])

    const smooth = backwards.reverse().join('')

    return smooth
}

const chunkData = (data = []) => {
    // This batches up the data the same way as the points on the line graph
    // doing this means the items in each table section matches the lines on the graph better.
    const batchedData = batchBy('mergedAt')(data)
    const firstBatch = batchedData.at(0) || []
    const lastBatch = batchedData.at(-1) || []

    const startDate = firstBatch.at(0) && new Date(firstBatch.at(0)?.mergedAt)
    const endDate = lastBatch.at(0)  && new Date(lastBatch.at(0)?.mergedAt)

    const totalDays = startDate && endDate
        ? differenceInDays(endDate,startDate)
        : 0

    const chunkyData = []
    batchedData
        .forEach((items = [], i) => {
            const chunkCount = chunkyData.length
            // Need to add id for table component
            const tableItems = items
                .map((item = {}, j) => ({
                    ...item,
                    id: `${i}-${j}`,
                }))

            const prDate = new Date(tableItems.at(0).mergedAt)

            const daysFromStart = differenceInDays(prDate,startDate)

            const percentToEndDate = Math.floor((daysFromStart/totalDays) * 100)
            const percentChunked = 10 * chunkCount

            chunkCount < 1 || (percentToEndDate >= percentChunked && chunkCount < 10 )
                ? chunkyData.push(tableItems)
                : chunkyData.at(-1).push(...tableItems)
        })

    return chunkyData
}

const getData = pathOr([{}], ['data'])

const getFirstLastDates = (lines = []) => {
    const dates = []
    lines
        .forEach(x => {
            const data = getData(x)
            dates.push(new Date(data.at(0).x))
            dates.push(new Date(data.at(-1).x))
        })

    return dates
}

const getReportMonthCount = (leftItems = [], rightItems = []) => {
    const allDates = getFirstLastDates([...leftItems, ...rightItems])

    const startDate = min(allDates)
    const endDate = max(allDates)

    const totalMonths = differenceInMonths(endDate, startDate)

    return totalMonths
}

export {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
    dateSort,
    chunkData,
    sumKeysValue,
    getReportMonthCount,
}