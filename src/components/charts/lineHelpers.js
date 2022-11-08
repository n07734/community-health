import { apply, pathOr } from 'ramda'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMonths from 'date-fns/differenceInMonths'
import min from 'date-fns/min'
import max from 'date-fns/max'

import { batchBy } from './batchBy'
import { sumKeysValue } from '../../utils'

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

const formatBatches = batches => dataKey => groupMath => batches
    .map((batch) => {
        const value = sumKeysValue(dataKey)(batch)

        const valueByTypes = {
            'average': Math.round(value / batch.length),
            'sum': value,
            'count': batch.length,
        }

        return {
            y: valueByTypes[groupMath],
            x: formatDate(batch[0].mergedAt),
        }
    })

const formatLineData = ({ data, dataKey, groupMath = 'average' }) => {
    const filteredData = data
        .filter(item => item.mergedAt && /\d+/.test(item[dataKey]))

    const sortedData = filteredData
        .sort(dateSort)

    const batchedData = batchBy('mergedAt')(sortedData)
    const formattedData = formatBatches(batchedData)(dataKey)(groupMath)

    return formattedData
}

const formatLinesData = (axix) => axix.lines
    .map(({ label, color, dataKey, groupMath, data: lineData }) => {
        const data = lineData || axix.data || []
        const formattedData = formatLineData({ data, dataKey, groupMath })

        return formattedData.length
            && ({
                id: label,
                color,
                data: formattedData,
            })
    })
    .filter(Boolean)

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
    const startDate = data.at(0) && new Date(data.at(0)?.mergedAt)
    const endDate = data.at(-1)  && new Date(data.at(-1)?.mergedAt)

    const totalDays = startDate && endDate
        ? differenceInDays(endDate,startDate)
        : 0

    const daysPerChunk = Math.round(totalDays/10)

    const chunkyData = []
    data
        .forEach((itemData, i) => {
            const chunkCount = chunkyData.length
            itemData.id = i
            const prDate = new Date(itemData.mergedAt)

            const daysFromStart = differenceInDays(prDate,startDate)
            const prsChunkNumber = Math.ceil(daysFromStart/daysPerChunk)

            prsChunkNumber <= 10 && (prsChunkNumber > chunkCount || chunkCount < 1)
                ? chunkyData.push([itemData])
                : chunkyData.at(-1).push(itemData)
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