import  {
    getYear,
    getMonth,
    getWeek,
    getDay,
    differenceInDays,
 } from 'date-fns'

 const isNewDay = (prev: string, current: string) => {
    const prevItemsDay = prev && getDay(new Date(prev)) + 1
    const currentItemsDay = current && getDay(new Date(current)) + 1

    return (prevItemsDay && currentItemsDay) && prevItemsDay !== currentItemsDay
}

const isNewWeek = (prev: string, current: string) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && prevItemsWeek !== currentItemsWeek
}

const isNewNthWeek = (mod: number) => (prev: string, current: string) => {
    const prevItemsWeek = prev && getWeek(new Date(prev))
    const currentItemsWeek = current && getWeek(new Date(current))

    return (prevItemsWeek && currentItemsWeek) && (prevItemsWeek % mod) > 0 && (currentItemsWeek % mod) === 0
}

const isNewMonth = (prev: string, current: string) => {
    const prevItemsMonth = prev && getMonth(new Date(prev)) + 1
    const currentItemsYear = current && getMonth(new Date(current)) + 1

    return (prevItemsMonth && currentItemsYear) && prevItemsMonth !== currentItemsYear
}

const isNewNthMonth = (mod: number) => (prev: string, current: string) => {
    const prevItemsMonth = prev && getMonth(new Date(prev)) + 1
    const currentItemsMonth = current && getMonth(new Date(current)) + 1

    return (prevItemsMonth && currentItemsMonth) && (prevItemsMonth % mod) > 0 && (currentItemsMonth % mod) === 0
}

const isNewYear = (prev: string, current: string) => {
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

type BatchType = '1day' | '1week' | '2week' | '3week' | '1month' | '1quarter' | '1year'
const batchByType = (key: string, batchType: BatchType) => (data: any[] = []) => {
    const batchedData: any[] = []
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

const batchByData = (data: any[] = []) => {
    const { mergedAt: startDate } = data.at(0)
    const { mergedAt: endDate } = data.at(-1)
    const totalDays = differenceInDays(new Date(endDate), new Date(startDate))


    type BatchTypePointCount = {
        batchType: BatchType,
        maxPoints: number,
    }
    const batchTypePointCounts:BatchTypePointCount[] = [
        {
            batchType: '1year',
            maxPoints: Math.ceil(totalDays/365),
        },
        {
            batchType: '1quarter',
            maxPoints: Math.ceil(totalDays/89),
        },
        {
            batchType: '1month',
            maxPoints: Math.ceil(totalDays/30),
        },
        {
            batchType: '2week',
            maxPoints: Math.ceil(totalDays/14),
        },
        {
            batchType: '1week',
            maxPoints: Math.ceil(totalDays/7),
        },
        {
            batchType: '1day',
            maxPoints: totalDays,
        },
    ]

    // Batch the data up by time type that will be closest to 15 items
    const { batchType } = batchTypePointCounts
        .reduce((current:BatchTypePointCount, next:BatchTypePointCount) =>
            !current.maxPoints || (Math.abs(next.maxPoints - 15) < Math.abs(current.maxPoints - 15))
                ? next
                : current
        ,{} as BatchTypePointCount)

    return batchByType('mergedAt', batchType)(data)
}

const batchBy = (data: any[] = []) => data.length < 1
    ? []
    : batchByData(data)

export {
    batchBy,
    batchByType,
}