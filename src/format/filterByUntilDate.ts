import pathOr from 'ramda/es/pathOr'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'

type Item = {
    node: {
        mergedAt?: string
        createdAt?: string
    }
}
const filterByUntilDate = (datePath:['node', 'mergedAt' | 'createdAt' ], order = 'DESC', untilDate = '') => (item: Item) => {
    const itemsDateValue = pathOr('', datePath, item)
    const itemsDate = itemsDateValue && new Date(itemsDateValue)
    const until = untilDate ? new Date(untilDate) : new Date()
    const shouldFilterIn = order === 'DESC'
        ? itemsDate && isAfter(itemsDate, until)
        : itemsDate && isBefore(itemsDate, until)

    return shouldFilterIn
}

export default filterByUntilDate
