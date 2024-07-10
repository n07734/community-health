import { PullRequest } from '../types/FormattedData';
import getUntilDate from './getUntilDate'

const prs = [
    {mergedAt: '2022-02-01'},
    {mergedAt: '2022-03-01'},
]

describe('getUntilDate: Get the date to request data util', () => {
    it('Returns date one month before oldest PR', () => {
        const result = getUntilDate(
            {
                amountOfData: 1,
                sortDirection: 'DESC',
            },
            prs as PullRequest[],
        )

        expect(result).toEqual(new Date('2022-01-01T00:00:00.000Z'))
    })

    it('Returns date two months after untilDate', () => {
        const result = getUntilDate(
            {
                amountOfData: 2,
                sortDirection: 'ASC',
                untilDate: '2022-04-01',
            },
            prs as PullRequest[],
        )

        expect(result).toEqual(new Date('2022-06-01T00:00:00.000Z'))
    })
});
