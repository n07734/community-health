import batch from './batch'

describe('batch:', () => {
    it('Applys function to each item', async() => {
        const result = await batch([1,2,3,4], (x:any) => x + 1, 3)
        expect(result).toEqual([2,3,4,5])
    })
})