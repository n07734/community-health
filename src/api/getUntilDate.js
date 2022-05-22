import {
    add,
    sub,
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

const getLatestPrDate = (order, allPrs = []) => {
    const { node: { mergedAt: currentEndDate } } = allPrs.at(-1)

    return new Date(currentEndDate)
}

const getUntilDate = (fetches = {}, allPrs = []) => {
    const {
        untilDate = '',
        amountOfData = 0,
    } = fetches
    // get first item from each result, sort then use that as base date to calculate from
    const changeBy = { months: amountOfData }

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
        x => x ? new Date(x) : new Date(),
        prop('untilDate'),
    )

    const dateFromPRs = compose(
        lastDate => add(lastDate, changeBy),
        sortDirection => getLatestPrDate(sortDirection, allPrs),
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
