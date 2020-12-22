import { apply } from 'ramda'
import batchBy from './batchBy'


const getMaxYValue = (data) => {
    const allValues = data
        .reduce((acc, { data }) => {
            const values = data
                .map(x => x.y)

            acc.push(...values)

            return acc
        }, [])

    const maxValue = apply(Math.max, allValues)

    return maxValue
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

const formatBatches = batches => dataKey => averageBy => batches
    .map((batch) => {
        const value = batch
            .reduce((acc, current) => (current[dataKey] || 0) + acc, 0)

        const valueByTypes = {
            'average': Math.round(value / batch.length),
            'sum': value,
            'count': batch.length,
        }

        return {
            y: valueByTypes[averageBy],
            x: formatDate(batch[0].mergedAt),
        }
    })

const formatLineData = (data, dataKey, averageBy = 'sum') => {
    const filteredData = data
        .filter(item => item.mergedAt && /\d+/.test(item[dataKey]))

    const sortedData = filteredData
        .sort(dateSort)

    const batchedData = batchBy('week')('mergedAt')(sortedData)
    const formattedData = formatBatches(batchedData)(dataKey)(averageBy)

    return formattedData
}

const formatLinesData = (axix) => axix.lines
    .map(({ label, pointColor, color, dataKey, groupMath, data: lineData }) => {
        const data = lineData || axix.data || []
        const formattedData = formatLineData(data, dataKey, groupMath)

        return formattedData.length
            && ({
                id: label,
                pointColor,
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

export {
    getMaxYValue,
    formatLinesData,
    formatGraphMarkers,
    smoothNumber,
    dateSort,
}