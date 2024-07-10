import formatRadarData from './radarData'

describe('formatRadarData:', () => {
    const usersData:any[] = [
        {
            age: 4,
            approvalsGiven: 2,
            approvalsReceived: 2,
            codeCommentsGiven: 2,
            codeCommentsReceived: 2,
            commentsGiven: 6,
            commentsReceived: 2,
            generalCommentsGiven: 2,
            generalCommentsReceived: 2,
            prSize: 400,
            totalPRs: 2,
            uniquePRsContributedTo: 4,
            uniquePRsApproved: 4,
            user: 'bob',
            author: 'bob',
        },
        {
            age: 2,
            approvalsGiven: 2,
            approvalsReceived: 2,
            codeCommentsGiven: 2,
            codeCommentsReceived: 2,
            commentsGiven: 2,
            commentsReceived: 6,
            generalCommentsGiven: 2,
            generalCommentsReceived: 2,
            prSize: 200,
            totalPRs: 0,
            uniquePRsContributedTo: 0,
            uniquePRsApproved: 0,
            user: 'BBB',
        },
    ]

    const base = formatRadarData(usersData)

    it('averagedData', () => {
        expect(base.averagedData).toMatchSnapshot()
    })

    it('maxValues', () => {
        expect(base.maxValues).toMatchSnapshot()
    })

    it('filter author', () => {
        const {
            averagedData,
            maxValues,
            user,
        } = formatRadarData(usersData, 'bob') as any

        expect(user.user).toEqual('bob')
        expect(maxValues).toEqual(base.maxValues)
        expect(averagedData).toMatchSnapshot()
    })
})
