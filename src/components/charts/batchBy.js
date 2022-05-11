import {
    cond,
    always,
    T,
} from 'ramda'
 const {
    getMonth,
    getWeek,
    getDay,
    differenceInMonths,
 } = require('date-fns')

 const isNewDay = (prev, current) => {
    const prevItemsDay = prev && getDay(new Date(prev))
    const currentItemsDay = current && getDay(new Date(current))

    return (prevItemsDay && currentItemsDay) && prevItemsDay !== currentItemsDay
}

const isNewWeek = (prev, current) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && prevItemsWeek !== currentItemsWeek
}

const isNewNthWeek = mod => (prev, current) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && (prevItemsWeek % mod) > 0 && (currentItemsWeek % mod) === 0
}

const isNewMonth = (prev, current) => {
    const prevItemsWeek = prev && getMonth(new Date(prev))
    const currentItemsWeek = current && getMonth(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && prevItemsWeek !== currentItemsWeek
}

const isNew = {
    '1day': isNewDay,
    '1week': isNewWeek,
    '2week': isNewNthWeek(2),
    '3week': isNewNthWeek(3),
    '1month': isNewMonth,
}

const batchByType = batchType => key => data => data
    .reduce((acc, item) => {
        const prevWeeks = acc.length > 1
            ? acc.slice(0, acc.length - 1)
            : []

        const currentWeek = acc[acc.length - 1] || []
        const prevItem = currentWeek[currentWeek.length - 1] || {}

        const all = isNew[batchType](prevItem[key], item[key])
            ? acc
                .concat([[item]])
            : prevWeeks
                .concat([currentWeek.concat(item)])

        return all
    }, [])

const batchByData = key => (data = []) => {
    const { mergedAt: startDate } = data.at(0)
    const { mergedAt: endDate } = data.at(-1)
    const totalMonths = differenceInMonths(new Date(endDate), new Date(startDate))

    return cond([
        [always(totalMonths >= 200), batchByType('1month')(key)],
        [always(totalMonths >= 60), batchByType('3week')(key)],
        [always(totalMonths >= 12), batchByType('2week')(key)],
        [always(totalMonths >= 6), batchByType('1week')(key)],
        [T, batchByType('1day')(key)],
    ])(data)
}

const batchBy = key => (data = []) => data.length < 1
    ? []
    : batchByData(key)(data)

export default batchBy