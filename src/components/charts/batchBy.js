import {
    cond,
    always,
    T,
} from 'ramda'
 const {
    getMonth,
    getWeek,
    differenceInMonths,
 } = require('date-fns')

const isXNewWeek = mod => (prev, current) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && (prevItemsWeek % mod) > 0 && (currentItemsWeek % mod) == 0
}

const isNewMonth = (prev, current) => {
    const prevItemsWeek = prev && getMonth(new Date(prev))
    const currentItemsWeek = current && getMonth(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && prevItemsWeek !== currentItemsWeek
}

const isNew = {
    1: isXNewWeek(1),
    2: isXNewWeek(2),
    3: isXNewWeek(3),
    month: isNewMonth,
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
        [always(totalMonths >= 200), batchByType('month')(key)],
        [always(totalMonths >= 60), batchByType(3)(key)],
        [always(totalMonths >= 12), batchByType(2)(key)],
        [T, batchByType(1)(key)],
    ])(data)
}

const batchBy = key => (data = []) => data.length < 1
    ? []
    : batchByData(key)(data)

export default batchBy