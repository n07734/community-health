import getUntilDate from './getUntilDate'

const prs = [
    {mergedAt: '2022-02-01'},
    {mergedAt: '2022-03-01'},
]

describe('getUntilDate: Get the date to request data util', () => {
    it('Returns no date if amountOfData is not a number', () => {
        const result = getUntilDate({ amountOfData: 'stringy' }, [])

        expect(result).toEqual('')
    })

    it('Returns date one month before oldest PR', () => {
        const result = getUntilDate(
            {
                amountOfData: 1,
                sortDirection: 'DESC',
            },
            prs,
        )

        expect(result).toEqual(new Date('2022-01-01T00:00:00.000Z'))
    })

    // it('Returns date two months after newest PR', () => {
    //     const result = getUntilDate(
    //         {
    //             amountOfData: 2,
    //             sortDirection: 'ASC',
    //         },
    //         prs,
    //     )

    //     expect(result).toEqual(new Date('2022-05-01T00:00:00.000Z'))
    // })

    it('Returns date two months after untilDate', () => {
        const result = getUntilDate(
            {
                amountOfData: 2,
                sortDirection: 'ASC',
                untilDate: '2022-04-01',
            },
            prs,
        )

        expect(result).toEqual(new Date('2022-06-01T00:00:00.000Z'))
    })

    // it('Returns date two months before untilDate', () => {
    //     const result = getUntilDate(
    //         {
    //             amountOfData: 2,
    //             sortDirection: 'DESC',
    //             untilDate: '2022-04-01',
    //         },
    //         prs,
    //     )

    //     expect(result).toEqual(new Date('2022-02-01T00:00:00.000Z'))
    // })
});
