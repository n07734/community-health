const weekInMS = 60000 * 60 * 24

const getWeekNumber = date => {
    const dateMS = date && new Date(date.split('T')[0]).getMilliseconds()
    const weekNumber = dateMS && Math.round((dateMS) / weekInMS)

    return weekNumber
}

const isNewWeek = (prev, current) => {
    const prevItemsWeek = getWeekNumber(prev)
    const currentItemsWeek = getWeekNumber(current)

    return (prevItemsWeek && currentItemsWeek) && prevItemsWeek !== currentItemsWeek
}

const batchWeekly = key => data => {
    const batches = []
    data
        .forEach((item) => {
            const currentWeek = batches.at(-1) || []
            const prevItem = currentWeek.at(-1) || {}

            !prevItem[key] || isNewWeek(item[key], prevItem[key])
                ? batches.push([item])
                : batches.at(-1).push(item)
        })

    return batches
}

const batchBy = type => key => data => ({
    'week': batchWeekly(key)(data),
})[type]

const foo = batchWeekly('date')([
    { date: '2018-04-08T06:13:35Z' },
    { date: '2018-04-08T16:29:02Z' },
])

console.log('-=-=-= foo', foo)