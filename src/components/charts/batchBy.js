const weekInMS = 60000 * 60 * 24 * 7

const getWeekNumber = date => {
    const dateMS = date && new Date(date.split('T')[0]).getTime()
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

        const all = isNewWeek(prevItem[key], item[key])
            ? acc
                .concat([[item]])
            : prevWeeks
                .concat([currentWeek.concat(item)])

        return all
    }, [])

const batchBy = type => key => data => ({
    'week': batchWeekly(key)(data),
})[type]

export default batchBy