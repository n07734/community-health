import { apply } from 'ramda'
import differenceInDays from 'date-fns/differenceInDays'

import batchBy from './batchBy'

const getAllYValues = data => data
    .reduce((acc, { data }) => {
        const values = data
            .map(x => x.y)

        acc.push(...values)

        return acc
    }, [])

const getMaxYValue = (data) => {
    const allValues = getAllYValues(data)

    const maxValue = apply(Math.max, allValues)

    return maxValue
}

const getMinYValue = (data) => {
    const allValues = getAllYValues(data)

    const minValue = apply(Math.min, allValues)

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
        const value = batch
            .reduce((acc, current) => (current[dataKey] || 0) + acc, 0)

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
    const [dateStart, dateEnd] = lineData
        .reduce(([start, end], { data = [] } = {}) => {
            const currentStart = data[0].x
            const currentEnd = data[data.length - 1].x

            return [
                !start || new Date(currentStart) < start
                    ? new Date(currentStart)
                    : start,
                !end || new Date(currentEnd) > end
                    ? new Date(currentEnd)
                    : end,
            ]
        }, [])

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

    const daysPerChunk = Math.ceil(totalDays/10)

    const chunkyData = [[]]
    data
        .forEach((itemData, i) => {
            itemData.id = i
            const prDate = new Date(itemData.mergedAt)
            const { mergedAt: prevMergedAt = '' } = chunkyData.at(-1).at(0) || {}
            const daysFromChunkStart = prevMergedAt
                ? differenceInDays(prDate,new Date(prevMergedAt))
                : 0

            daysFromChunkStart > daysPerChunk
                ? chunkyData.push([itemData])
                : chunkyData.at(-1).push(itemData)
        })

    return chunkyData
}

export {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
    dateSort,
    chunkData,
}