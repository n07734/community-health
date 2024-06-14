import { batchBy } from './batchBy'

describe('batchBy:', () => {
    it('Data is split by week', () => {
        const data = [
            { mergedAt: '2020-01-02' },
            { mergedAt: '2020-01-03' },
            { mergedAt: '2020-07-06' },
            { mergedAt: '2020-07-07' },
        ]
        expect(batchBy(data).length).toEqual(2)
    })

    it('Data split by days', () => {
        const data = [
            { mergedAt: '2020-01-12' },
            { mergedAt: '2020-01-13' },
        ]
        expect(batchBy(data).length).toEqual(1)
    })
})