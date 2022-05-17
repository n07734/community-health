import {
    add,
    sub,
    startOfMonth,
    endOfMonth,
 } from 'date-fns'

import {
    allPass,
    always,
    compose,
    prop,
    propEq,
    propOr,
    is,
    isEmpty,
    cond,
    T as alwaysTrue,
} from 'ramda'

// TODO: rely or state's pr sort
const dateSort = (order) => ({ node: { mergedAt: a } },{ node: { mergedAt: b } }) => order === 'DESC'
    ? new Date(a).getTime() > new Date(b).getTime()
    : new Date(a).getTime() - new Date(b).getTime()

const getCurrentEndMonth = (order, allPrs = []) => {
    const sortedPRs = allPrs.sort(dateSort(order))
    const { node: { mergedAt: currentEndDate } } = sortedPRs.at(-1)

    return endOfMonth(new Date(currentEndDate))
}

const getUntilDate = (fetches = {}, allPrs = []) => {
    const {
        untilDate = '',
        amountOfData = 0,
    } = fetches
    // get first item from each result, sort then use that as base date to calculate from
    const changeBy = { months: amountOfData }

    // TODO: get better ASC date, also both for when it is top up data
    // const newUntilDate = order === 'DESC'
    //     ? sub(startOfMonth(untilDate || new Date()), changeBy)
    //     : add(getCurrentEndMonth(order, allPrs), changeBy)

    const amountOfDataIsString = compose(
        is(String),
        prop('amountOfData')
    )

    const isDesc = propEq('sortDirection', 'DESC')
    const isAsc = propEq('sortDirection', 'ASC')

    const noDateUntil = compose(
        isEmpty,
        prop('untilDate')
    )

    const subtractDate = compose(
        x => sub(x, changeBy),
        startOfMonth,
        x => x ? new Date(x) : new Date(),
        prop('untilDate'),
    )

    const dateFromPRs = compose(
        lastDate => add(lastDate, changeBy),
        sortDirection => getCurrentEndMonth(sortDirection, allPrs),
        propOr('', 'sortDirection'),
    )

    const newUntilDate = cond([
        [amountOfDataIsString, always('')],
        [isDesc, subtractDate],
        [allPass([isAsc, noDateUntil]), dateFromPRs],
        [isAsc, add(new Date(untilDate), changeBy)],
        [alwaysTrue, always('')],
    ])(fetches)

    return newUntilDate
}

export default getUntilDate
