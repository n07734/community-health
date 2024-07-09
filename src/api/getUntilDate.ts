import {
    add,
    sub,
 } from 'date-fns'

import {
    compose,
    prop,
    propOr,
    is,
} from 'ramda'

const getPrDate = (sortDirection: SortDirection, allPrs = []) => {
    const prIndex = sortDirection === 'DESC'
        ? 0
        : -1

    const pr: AnyObject = allPrs.at(prIndex) || {}

    const currentEndDate = (pr?.node?.mergedAt || pr?.mergedAt) as string

    return new Date(currentEndDate)
}

const getUntilDate = (fetches = { untilDate: '', amountOfData: '', sortDirection: ''}, allPrs = []) => {
    const {
        untilDate = '',
        amountOfData = 0,
        sortDirection = 'DESC',
    } = fetches
    // get first item from each result, sort then use that as base date to calculate from
    const changeBy = { months: amountOfData as number}

    const amountOfDataIsString = compose(
        is(String),
        prop('amountOfData'),
    )


    const noDateUntil = compose(
        x => !(typeof x === 'string' && x.length > 1),
        prop('untilDate'),
    )

    const subtractDate = compose(
        x => sub(x as any, changeBy),
        x => x ? new Date(x as string) : new Date(),
        prop('untilDate'),
    )

    const dateFromPRs = compose(
        ({ prDate, sortDirection }) => sortDirection === 'DESC'
            ? sub(prDate, changeBy)
            : add(prDate, changeBy),
        sortDirection => ({
            prDate: getPrDate(sortDirection as SortDirection, allPrs),
            sortDirection,
        }),
        propOr('', 'sortDirection'),
    )

    const [,newUntilDate] = [
        [amountOfDataIsString(fetches),''],
        [noDateUntil(fetches) && allPrs.length > 0, dateFromPRs(fetches)],
        [sortDirection === 'DESC', subtractDate(fetches)],
        [sortDirection === 'ASC', add(new Date(untilDate), changeBy)],
        [true, ''],
    ].find(([condition]) => condition) || []

    return newUntilDate
}

export default getUntilDate
