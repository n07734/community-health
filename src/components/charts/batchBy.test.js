import batchBy from './batchBy'

describe('batchBy:', () => {
    it('Only one week of data', () => {
        const data = [
            { date: '2020-01-06' },
            { date: '2020-01-12' },
        ]
        expect(batchBy('week')('date')(data).length).toEqual(1)
    })

    it('Data from two weeks', () => {
        const data = [
            { date: '2020-01-12' },
            { date: '2020-01-13' },
        ]
        expect(batchBy('week')('date')(data).length).toEqual(2)
    })
})