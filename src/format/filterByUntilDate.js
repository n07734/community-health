import { pathOr } from 'ramda'
import { isAfter, isBefore } from 'date-fns'

const filterByUntilDate = (datePath = [], order = 'DESC', untilDate = '') => (item) => {
    const itemsDateValue = pathOr('', datePath, item)
    const itemsDate = itemsDateValue && new Date(itemsDateValue)
    const until = untilDate ? new Date(untilDate) : new Date()
    const shouldFilterIn = order === 'DESC'
        ? itemsDate && isAfter(itemsDate, until)
        : itemsDate && isBefore(itemsDate, until)

    return shouldFilterIn
}

export default filterByUntilDate
