import add from 'date-fns/add'
import sub from 'date-fns/sub'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

const dateSort = (order) => ({ node: { mergedAt: a } },{ node: { mergedAt: b } }) => order === 'DESC'
    ? new Date(a).getTime() > new Date(b).getTime()
    : new Date(a).getTime() - new Date(b).getTime()

const getCurrentEndMonth = (order, allPrs = []) => {
    const sortedPRs = allPrs.sort(dateSort(order))
    const { node: { mergedAt: currentEndDate } } = sortedPRs.at(-1)

    return endOfMonth(new Date(currentEndDate))
}

const getUntilDate = ({order = 'DESC', amountOfData}, allPrs = []) => {
    // get first item from each result, sort then use that as base date to calculate from
    const changeBy = { months: amountOfData }

    // TODO: get better ASC date, also both for when it is top up data
    const untilDate = order === 'DESC'
        ? sub(startOfMonth(new Date()), changeBy)
        : add(getCurrentEndMonth(order, allPrs), changeBy)

    return untilDate
}

export default getUntilDate
