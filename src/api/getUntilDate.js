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
    path,
    is,
    cond,
    T as alwaysTrue,
} from 'ramda'

const getPrDate = (sortDirection, allPrs = []) => {
    const prIndex = sortDirection === 'DESC'
        ? 0
        : -1

    const pr = allPrs.at(prIndex)

    const currentEndDate = path(['node', 'mergedAt'], pr) || prop('mergedAt', pr)

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
        x => !(typeof x === 'string' && x.length > 1),
        prop('untilDate')
    )

    const subtractDate = compose(
        x => sub(x, changeBy),
        x => x ? new Date(x) : new Date(),
        prop('untilDate'),
    )

    const dateFromPRs = compose(
        ({ prDate, sortDirection }) => sortDirection === 'DESC'
            ? sub(prDate, changeBy)
            : add(prDate, changeBy),
        sortDirection => ({
            prDate: getPrDate(sortDirection, allPrs),
            sortDirection
        }),
        propOr('', 'sortDirection'),
    )

    const newUntilDate = cond([
        [amountOfDataIsString, always('')],
        [allPass([noDateUntil, () => allPrs.length > 0]), dateFromPRs],
        [isDesc, subtractDate],
        [isAsc, () => add(new Date(untilDate), changeBy)],
        [alwaysTrue, always('')],
    ])(fetches)

    return newUntilDate
}

export default getUntilDate
