import getYear from 'date-fns/getYear'
import getMonth from 'date-fns/getMonth'
import getWeek from 'date-fns/getWeek'
import getDay from 'date-fns/getDay'
import differenceInDays from 'date-fns/differenceInDays'

const isNewDay = (prev: string, current: string) => {
    const prevItemsDay = prev && getDay(new Date(prev)) + 1
    const currentItemsDay = current && getDay(new Date(current)) + 1

    return (prevItemsDay && currentItemsDay) && prevItemsDay !== currentItemsDay
        ? true
        : false
}

const isNewWeek = (prev: string, current: string) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && prevItemsWeek !== currentItemsWeek
        ? true
        : false
}

const isNewNthWeek = (mod: number) => (prev: string, current: string) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && (prevItemsWeek % mod) > 0 && (currentItemsWeek % mod) === 0
        ? true
        : false
}

const isNewMonth = (prev: string, current: string) => {
    const prevItemsMonth = prev && getMonth(new Date(prev)) + 1
    const currentItemsYear = current && getMonth(new Date(current)) + 1

    return (prevItemsMonth && currentItemsYear) && prevItemsMonth !== currentItemsYear
        ? true
        : false
}

const isNewNthMonth = (mod: number) => (prev: string, current: string) => {
    const prevItemsMonth = prev && getMonth(new Date(prev)) + 1
    const currentItemsMonth = current && getMonth(new Date(current)) + 1

    return (prevItemsMonth && currentItemsMonth) && (prevItemsMonth % mod) > 0 && (currentItemsMonth % mod) === 0
        ? true
        : false
}

const isNewYear = (prev: string, current: string) => {
    const prevItemsYear = prev && getYear(new Date(prev))
    const currentItemsYear = current && getYear(new Date(current))

    return (prevItemsYear && currentItemsYear) && prevItemsYear !== currentItemsYear
        ? true
        : false
}

type IsNew = {
    '1day': (prev: string, current: string) => boolean,
    '1week': (prev: string, current: string) => boolean,
    '2week': (prev: string, current: string) => boolean,
    '3week': (prev: string, current: string) => boolean,
    '1month': (prev: string, current: string) => boolean,
    '1quarter': (prev: string, current: string) => boolean,
    '1year': (prev: string, current: string) => boolean,
}
const isNew:IsNew = {
    '1day': isNewDay,
    '1week': isNewWeek,
    '2week': isNewNthWeek(2),
    '3week': isNewNthWeek(3),
    '1month': isNewMonth,
    '1quarter': isNewNthMonth(3),
    '1year': isNewYear,
}

type BatchType = keyof IsNew
const batchByType = <K extends keyof T, T>(key: K, batchType:BatchType, data: T[] = []) => {
    const batchedData: T[][] = []
    data
        .forEach((item) => {
            const currentWeek = batchedData.at(-1) as T[] || []
            const prevItem = (currentWeek.at(-1) || {}) as T

            !prevItem[key] || isNew[batchType](prevItem[key] as string, item[key] as string)
                ? batchedData
                    .push([item])
                : (batchedData.at(-1) as T[][])
                    .push(item as T[])
        })

    return batchedData;
}

const batchByData = <T extends { mergedAt: string }>(data: T[] = []) => {
    const { mergedAt: startDate } = data.at(0) as T
    const { mergedAt: endDate } = data.at(-1) as T
    const totalDays = differenceInDays(new Date(endDate), new Date(startDate))

    type BatchTypePointCount = {
        batchType: BatchType,
        maxPoints: number,
    }
    const batchTypePointCounts: BatchTypePointCount[] = [
        {
            batchType: '1year',
            maxPoints: Math.ceil(totalDays / 365),
        },
        {
            batchType: '1quarter',
            maxPoints: Math.ceil(totalDays / 89),
        },
        {
            batchType: '1month',
            maxPoints: Math.ceil(totalDays / 30),
        },
        {
            batchType: '2week',
            maxPoints: Math.ceil(totalDays / 14),
        },
        {
            batchType: '1week',
            maxPoints: Math.ceil(totalDays / 7),
        },
        {
            batchType: '1day',
            maxPoints: totalDays,
        },
    ]

    // Batch the data up by time type that will be closest to 15 items
    const { batchType } = batchTypePointCounts
        .reduce((current: BatchTypePointCount, next: BatchTypePointCount) =>
            !current.maxPoints || (Math.abs(next.maxPoints - 15) < Math.abs(current.maxPoints - 15))
                ? next
                : current
        , {} as BatchTypePointCount)

    return batchByType('mergedAt', batchType, data)
}

const batchBy = <T extends { mergedAt: string }>(data: T[] = []) => data.length < 1
    ? []
    : batchByData(data)

export {
    batchBy,
    batchByType,
}