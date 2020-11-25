import batch from './batch'

describe('batch:', () => {
    it('Empty call returns blank arrray', () => {
        const result = batch()
        expect(result).toEqual([])
    })

    it('Applys function to each item', async() => {
        const result = await batch([1,2,3,4], x => x+1, 3)
        expect(result).toEqual([2,3,4,5])
    })

})