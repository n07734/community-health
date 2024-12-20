import { RawDataResult } from '../types/RawData'
import {
    formatPullRequests,
    formatIssues,
    formatReleases,
} from './rawData'

const repoData = (type:string) => (formatItems:any) => (items:any[] = [])=> [{
    data: {
        result: {
            [type]: {
                edges: items
                    .map(formatItems),
            },
        },
    },
}] as RawDataResult[]

describe('formatPullRequests:', () => {
    const makePullRequest = ({ overrides = {}, reviews = [], comments = [] } = {}) => {
        const makeComments = (comments:any) => comments
            .map(({ author }:any = {}) => ({
                node: {
                    author: {
                        login: author,
                    },
                },
            }))

        const makeReviews = (reviews:any[]) => reviews
            .map(({ state, author, comments = [] } = {}) => ({
                node: {
                    state,
                    author: {
                        login: author,
                    },
                    comments: {
                        edges: makeComments(comments),
                    },
                },
            }))

        const data = {
            repository: {
                name: 'REPO',
                owner: {
                    login: 'ORG',
                },
            },
            author: {
                login: 'AUTHOR',
            },
            url:'',
            additions:0,
            deletions:0,
            changedFiles:0,
            createdAt:'',
            mergedAt:'',
            reviews: {
                edges: makeReviews(reviews),
            },
            comments: {
                edges: makeComments(comments),
            },
        }

        const updatedData = {
            ...data,
            ...overrides,
        }

        return { node: updatedData }
    }

    const makePullRequests = repoData('pullRequests')(makePullRequest)

    it('Expect basic PR to match snapshot', () => {
        const result = formatPullRequests({ excludeIds: [] } as any, makePullRequests([{}]))
        expect(result).toMatchSnapshot()
    })

    it('Expect basic PR values to be correct', () => {
        const data = makePullRequests([{
            overrides: {
                repository: {
                    name: 'REPO',
                    owner: {
                        login: 'ORG',
                    },
                },
                author: {
                    login: 'AUTHOR',
                },
                url: 'URL',
                additions: 100,
                deletions: 100,
                changedFiles: 10,
                createdAt: '1999-12-31',
                mergedAt: '2000-01-02',
            },
        }])
        const result = formatPullRequests({ excludeIds: [] } as any, data)
        expect(result).toMatchSnapshot()
    })

    it('Expect comments and approvals to be formatted correctly', () => {
        const data = makePullRequests([{
            comments: [
                { author: 'AUTHOR' },
                { author: 'BOB' },
            ],
            reviews: [
                {
                    state: 'FOO',
                    comments: [
                        { author: 'AUTHOR' },
                        { author: 'BILL' },
                    ],
                },
                {
                    state: 'APPROVED',
                    author: 'FRANK',
                    comments: [
                        { author: 'AUTHOR' },
                        { author: 'BILL' },
                    ],
                },
            ],
        }])

        const result = formatPullRequests({ excludeIds: [] } as any, data)
        expect(result).toMatchSnapshot()
    })
})

describe('formatIssues:', () => {
    const makeIssue = ({
        createdAt = '1999',
        closedAt = '2000',
        title = 'ISSUE TITLE',
        labels = [],
    }) => ({
        node: {
            createdAt,
            closedAt,
            title,
            labels: {
                edges: labels,
            },
            url: 'url',
        },
    })
    const makeIssues = repoData('issues')(makeIssue)

    it('Empty call to return an array', () => {
        const result = formatIssues([])
        expect(result).toEqual([])
    })

    it('Normal issue', () => {
        const [result] = formatIssues(makeIssues([
            {
                title: 'Normal issue',
                createdAt: '1234',
                closedAt: '1234',
                labels: [ {node: {name:'label'}} ],
            },
        ]))
        expect(result).toEqual({
            age: 1,
            mergedAt: '1234',
            createdAt: '1234',
            isBug: false,
            url: 'url',
        })
    })

    it('Issue is bug from title', () => {
        const [result] = formatIssues(makeIssues([{ title: 'bug issue' }]))
        expect(result.isBug).toEqual(true)
    })

    it('Issue is bug from lable', () => {
        const [result] = formatIssues(makeIssues([
            {
                title: 'issue title',
                labels: [
                    {node:{ name:'ant'}},
                    {node:{ name:'bug'}},
                ],
            },
        ]))
        expect(result.isBug).toEqual(true)
    })
})

describe('formatReleases:', () => {
    const makeRelease = ({ createdAt = '2020', name }:any) => ({
        node: {
            createdAt,
            tag: {
                name,
            },
        },
    })
    const makeReleases = repoData('releases')(makeRelease)

    it('Empty call to return an array', () => {
        const result = formatReleases([])
        expect(result).toEqual([])
    })

    it('Gets tag and date', () => {
        const [result] = formatReleases(makeReleases([{name:'name'}]) as any)
        expect(result.description).toEqual('name')
        expect(result.date).toEqual('2020')
    })

    it('Date is passed back correctly', () => {
        const [result] = formatReleases(makeReleases([{ name: '1.0.0', createdAt: '1000' }]) as any)
        expect(result.date).toEqual('1000')
    })

    it('With each release type', () => {
        const result = formatReleases(makeReleases([
            { name: '1.0.0' },
            { name: '1.1.0' },
            { name: '1.1.1' },
            { name: '5.0.0-alpha.7' },
        ]) as any)

        const expected = [
            {
                date: '2020',
                description: '1.0.0',
            },
            {
                date: '2020',
                description: '1.1.0',

            },
            {
                date: '2020',
                description: '1.1.1',

            },
            {
                date: '2020',
                description: '5.0.0-alpha.7',
            },
        ]
        expect(result).toEqual(expected)
    })
})