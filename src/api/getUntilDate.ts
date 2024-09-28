import sub from 'date-fns/sub'
import add from 'date-fns/add'
import compose from 'ramda/es/compose'
import prop from 'ramda/es/prop'
import propOr from 'ramda/es/propOr'
import is from 'ramda/es/is'

import { SortDirection, UntilDate } from '../types/Queries'
import { PullRequest } from '../types/FormattedData'
import { RawPullRequest } from '../types/RawData'

type PR = RawPullRequest | PullRequest

const getPrDate = (sortDirection: SortDirection, allPrs:PR[] = []) => {
    const prIndex = sortDirection === 'DESC'
        ? 0
        : -1

    const pr = allPrs.at(prIndex)

    const currentEndDate: string = ((pr as RawPullRequest)?.node?.mergedAt || (pr as PullRequest)?.mergedAt)

    return new Date(currentEndDate)
}

type Fetches = {
    untilDate?: UntilDate,
    amountOfData: number | string,
    sortDirection: SortDirection
}
const getUntilDate = (
    fetches:Fetches,
    allPrs:PullRequest[] = []) => {
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
        x => sub(x as number, changeBy),
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
