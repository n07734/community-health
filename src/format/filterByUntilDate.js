import { pathOr } from 'ramda'
import { isAfter, isBefore } from 'date-fns'

const filterByUntilDate = (dateKey, order = 'DESC', untilDate = '') => (item) => {
    const itemsDateValue = pathOr('', ['node', dateKey], item)
    const itemsDate = itemsDateValue && new Date(itemsDateValue)
    const until = new Date(untilDate)
    const shouldFilterIn = order === 'DESC'
        ? isAfter(itemsDate, until)
        : isBefore(itemsDate, until)

    return shouldFilterIn
}

export default filterByUntilDate
