import { UserData } from '../types/State'
import formatUserData from './userData'

const pr = {
    org: 'org',
    repo: 'repo',
    author: 'bob',
    prSize: 0,
    age: 0,
    approvals: 0,
    approvers: {},
    comments: 0,
    commenters: {},
    codeComments: 0,
    codeCommenters: {},
    generalComments: 0,
    generalCommenters: {},
    uniquePRsContributedTo: 0,
}
describe('formatUserData:', () => {

    it('PR data from two authors with no contributors to match snapshot', () => {
        const result = formatUserData([
            pr,
            pr,
            {
                ...pr,
                author: 'smith',
            },
        ] as any, { bob: { a:1 }, smith: { a:1 } })
        expect(result).toMatchSnapshot()
    })


    it('Basic PR data transfers to result', () => {
        const baicPR = {
            ...pr,
            approvals: 1,
            comments: 2,
            codeComments: 3,
            generalComments: 4,
        }
        const result = formatUserData([baicPR] as any, { bob: { a:1 } })
        expect(result).toMatchSnapshot()
    })

    it('prSize data formats corretly', () => {
        const [user] = formatUserData([
            {
                ...pr,
                additions: 100,
            },
            {
                ...pr,
                additions: 300,
            },
        ] as any, { bob: { a:1 }})
        expect(user.prSize).toEqual(200)
        expect(user.totalPRs).toEqual(2)
    })

    it('age data formats corretly', () => {
        const [user] = formatUserData([
            {
                ...pr,
                age: 4,
            },
            {
                ...pr,
                age: 6,
            },
        ] as any, { bob: { a:1 }})
        expect(user.age).toEqual(5)
    })

    // BUG un PRed approver not counted properly
    describe('contributor info:', () => {
        const results = formatUserData([
            {
                ...pr,
                approvals: 3,
                author: 'bob',
                approvers: {
                    unknown: 1,
                    smith: 2,
                },
                codeComments: 3,
                codeCommenters: {
                    unknown: 1,
                    smith: 2,
                },
                generalComments: 3,
                generalCommenters: {
                    unknown: 1,
                    smith: 2,
                },
                comments: 6,
                commenters: {
                    unknown: 2,
                    smith: 4,
                },
            },
            {
                ...pr,
                author: 'smith',
                approvals: 1,
                approvers: {
                    bob: 1,
                },
                codeComments: 1,
                codeCommenters: {
                    bob: 1,
                },
                generalComments: 1,
                generalCommenters: {
                    bob: 1,
                },
                comments: 2,
                commenters: {
                    bob: 2,
                },
            },
        ] as any, { bob: { a:1 }, smith: { a:1 } })

        const bob = results.find(x => x.author === 'bob') as UserData
        const smith = results.find(x => x.author === 'smith') as UserData

        it('approvers', () => {
            expect(bob.approvalsReceived).toEqual(3)
            expect(smith.approvalsReceived).toEqual(1)

            expect(bob.approvalsByUser).toEqual({
                smith: 1,
            })
            expect(smith.approvalsByUser).toEqual({
                bob: 1,
            })

            expect(bob.approvalsGiven).toEqual(1)
            expect(smith.approvalsGiven).toEqual(2)
        })

        it('codeComments', () => {
            expect(bob.codeCommentsReceived).toEqual(3)
            expect(smith.codeCommentsReceived).toEqual(1)

            expect(bob.codeCommentsGiven).toEqual(1)
            expect(smith.codeCommentsGiven).toEqual(2)
        })

        it('generalComments', () => {
            expect(bob.generalCommentsReceived).toEqual(3)
            expect(smith.generalCommentsReceived).toEqual(1)

            expect(bob.generalCommentsGiven).toEqual(1)
            expect(smith.generalCommentsGiven).toEqual(2)
        })

        it('comments', () => {
            expect(bob.commentsReceived).toEqual(6)
            expect(smith.commentsReceived).toEqual(2)

            expect(bob.commentsGiven).toEqual(2)
            expect(smith.commentsGiven).toEqual(4)
        })

        it('uniquePRsContributedTo', () => {
            expect(bob.uniquePRsContributedTo).toEqual(1)
            expect(smith.uniquePRsContributedTo).toEqual(1)
        })
    })
})