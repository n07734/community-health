import {
    cond,
    always,
    T,
} from 'ramda'
 const {
    getYear,
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
    const prevItemsMonth = prev && getMonth(new Date(prev))
    const currentItemsYear = current && getMonth(new Date(current))

    return (prevItemsMonth && currentItemsYear) && prevItemsMonth !== currentItemsYear
}

const isNewNthMonth = mod => (prev, current) => {
    const prevItemsMonth = prev && getMonth(new Date(prev))
    const currentItemsMonth = current && getMonth(new Date(current))

    return (prevItemsMonth && currentItemsMonth) && (prevItemsMonth % mod) > 0 && (currentItemsMonth % mod) === 0
}


const isNewYear = (prev, current) => {
    const prevItemsYear = prev && getYear(new Date(prev))
    const currentItemsYear = current && getYear(new Date(current))

    return (prevItemsYear && currentItemsYear) && prevItemsYear !== currentItemsYear
}

const isNew = {
    '1day': isNewDay,
    '1week': isNewWeek,
    '2week': isNewNthWeek(2),
    '3week': isNewNthWeek(3),
    '1month': isNewMonth,
    '1quarter': isNewNthMonth(3),
    '1year': isNewYear,
}


const batchByType = (key, batchType) => data => {
    const batchedData = []
    data
        .forEach((item) => {
            const currentWeek = batchedData.at(-1) || []
            const prevItem = currentWeek.at(-1) || {}

            !prevItem[key] || isNew[batchType](prevItem[key], item[key])
                ? batchedData
                    .push([item])
                : batchedData.at(-1)
                    .push(item)
        })

    return batchedData;
}

const batchByData = key => (data = []) => {
    const { mergedAt: startDate } = data.at(0)
    const { mergedAt: endDate } = data.at(-1)
    const totalMonths = differenceInMonths(new Date(endDate), new Date(startDate))

    return cond([
        [always(totalMonths >= 288), batchByType(key, '1year')],
        [always(totalMonths >= 84), batchByType(key, '1quarter')],
        [always(totalMonths >= 60), batchByType(key, '3week')],
        [always(totalMonths >= 12), batchByType(key, '2week')],
        [always(totalMonths >= 6), batchByType(key, '1week')],
        [T, batchByType(key, '1day')],
    ])(data)
}

const batchBy = key => (data = []) => data.length < 1
    ? []
    : batchByData(key)(data)

export {
    batchBy,
    batchByType,
}