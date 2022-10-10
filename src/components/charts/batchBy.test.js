import { batchBy } from './batchBy'

describe('batchBy:', () => {
    it('Data is split by week', () => {
        const data = [
            { date: '2020-01-02' },
            { date: '2020-01-03' },
            { date: '2020-07-06' },
            { date: '2020-07-07' },
        ]
        expect(batchBy('date')(data).length).toEqual(2)
    })

    it('Data split by days', () => {
        const data = [
            { date: '2020-01-12' },
            { date: '2020-01-13' },
        ]
        expect(batchBy('date')(data).length).toEqual(2)
    })
})