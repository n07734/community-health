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

const batchWeekly = key => data => data
    .reduce((acc, item) => {
        const prevWeeks = acc.length > 1
            ? acc.slice(0, acc.length - 1)
            : []

        const currentWeek = acc[acc.length - 1] || []
        const prevItem = currentWeek[currentWeek.length - 1] || {}

        const all = isNewWeek(item[key], prevItem[key])
            ? [...prevWeeks, currentWeek, [item]]
            : [...prevWeeks, [...currentWeek, item]]

        return all
    }, [])

const batchBy = type => key => data => ({
    'week': batchWeekly(key)(data),
})[type]

const foo = batchWeekly('date')([
    { date: '2018-04-08T06:13:35Z' },
    { date: '2018-04-08T16:29:02Z' },
])

console.log('-=-=-= foo', foo)