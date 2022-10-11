import filterByUntilDate from './filterByUntilDate'

const items = [
    { date: '2020-01-01' },
    { date: '2020-02-01' },
    { date: '2020-03-01' },
]

describe('filterByUntilDate', () => {
    it('filter out early results', () => {
        const result = items.filter(filterByUntilDate(['date'], 'DESC', '2020-01-01'))

        expect(result).toEqual([
            { date: '2020-02-01' },
            { date: '2020-03-01' },
        ])
    })

    it('filter out later results', () => {
        const result = items.filter(filterByUntilDate(['date'], 'ASC', '2020-03-01'))

        expect(result).toEqual([
            { date: '2020-01-01' },
            { date: '2020-02-01' },
        ])
    })
})
