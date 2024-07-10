import filterByUntilDate from './filterByUntilDate'

const items = [
    {
        node: { createdAt: '2020-01-01' },
    },
    {
        node: { createdAt: '2020-02-01' },
    },
    {
        node: { createdAt: '2020-03-01' },
    },
]

describe('filterByUntilDate', () => {
    it('filter out early results', () => {
        const result = items.filter(filterByUntilDate(['node', 'createdAt'], 'DESC', '2020-01-01'))

        expect(result).toEqual([
             { node: { createdAt: '2020-02-01' }},
             { node: { createdAt: '2020-03-01' }},
        ])
    })

    it('filter out later results', () => {
        const result = items.filter(filterByUntilDate(['node', 'createdAt'], 'ASC', '2020-03-01'))

        expect(result).toEqual([
             { node: { createdAt: '2020-01-01' }},
             { node: { createdAt: '2020-02-01' }},
        ])
    })
})
