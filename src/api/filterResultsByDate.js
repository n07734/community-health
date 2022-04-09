import {
    pathOr,
} from 'ramda'
import add from 'date-fns/add'
import sub from 'date-fns/sub'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

const dateSort = (order) => ({ node: { mergedAt: a } },{ node: { mergedAt: b } }) => order === 'DESC'
    ? new Date(a).getTime() > new Date(b).getTime()
    : new Date(a).getTime() - new Date(b).getTime()

const getUntilDate = ({order = 'DESC', amountOfData}, data) => {
    // get first item from each result, sort then use that as base date to calculate from
    const changeBy = { months: amountOfData }

    const allPrs = pathOr([], ['data', 'result', 'pullRequests', 'edges'], data)

    const sortedPRs = allPrs.sort(dateSort(order))

    // Get all first PR result's date
    const { node: { mergedAt: startDate } } = sortedPRs.at(0)
    const { node: { mergedAt: currentEndDate } } = sortedPRs.at(-1)
    console.log('-=-=--startDate', startDate)
    console.log('-=-=--currentEndDate', currentEndDate)

    const untilDate = order === 'DESC'
        ? sub(startOfMonth(new Date(startDate)), changeBy)
        : add(endOfMonth(new Date(startDate)), changeBy)

    console.log('-=-=--untilDate, startingPoint,amountOfData', untilDate, order, amountOfData)

    return untilDate
}

const filterResultsByDate = (fetchInfo, results) => {
    const untilDate = getUntilDate(fetchInfo, results)
    console.log('-=-=--untilDate', untilDate)

    return results
}

export default filterResultsByDate
