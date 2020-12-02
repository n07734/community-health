import {
    formatRepo,
    formatPullRequests,
    formatIssues,
    formatReleases,
} from './rawData'

const repoData = type => formatItems => (items = []) => ({
    data: {
        repository: {
            [type]: {
                edges: items
                    .map(formatItems),
            },
        },
    },
})

describe('formatRepo:', () => {
    it('Empty call to return a blank repo', () => {
        const result = formatRepo()
        expect(result).toEqual({
            name: '',
            org: '',
            pullRequests: [],
        })
    })

    it('Empty call to return a basic repo', () => {
        const result = formatRepo({
            data: {
                repository: {
                    name: 'REPO',
                    owner: {
                        login: 'ORG',
                    },
                },
            },
        })
        expect(result).toEqual({
            name: 'REPO',
            org: 'ORG',
            pullRequests: [],
        })
    })
})

describe('formatPullRequests:', () => {
    const makePullRequest = ({ overrides = {}, reviews = [], comments = [] } = {}) => {
        const makeComments = comments => comments
            .map(({ author } = {}) => ({
                node: {
                    author: {
                        login: author,
                    },
                },
            }))

        const makeReviews = reviews => reviews
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

    it('Empty call to return an array', () => {
        const result = formatPullRequests()
        expect(result).toEqual([])
    })

    it('Expect basic PR to match snapshot', () => {
        const result = formatPullRequests(makePullRequests([{}]))
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
        const result = formatPullRequests(data)
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

        const result = formatPullRequests(data)
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
        },
    })
    const makeIssues = repoData('issues')(makeIssue)

    it('Empty call to return an array', () => {
        const result = formatIssues()
        expect(result).toEqual([])
    })

    it('Normal issue', () => {
        const [result] = formatIssues(makeIssues([
            {
                title: 'Normal issue',
                createdAt: '1234',
                closedAt: '5678',
                labels: [ {node: {name:'label'}} ],
            },
        ]))
        expect(result).toEqual({
            closedAt: '5678',
            createdAt: '1234',
            mergedAt: '1234',
            isBug: false,
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
    const makeRelease = ({ createdAt = '2020', name }) => ({
        node: {
            createdAt,
            tag: {
                name,
            },
        },
    })
    const makeReleases = repoData('releases')(makeRelease)

    it('Empty call to return an array', () => {
        const result = formatReleases()
        expect(result).toEqual([])
    })

    it('With invalid semver returns as PATCH', () => {
        const [result] = formatReleases(makeReleases([{name:'name'}]))
        expect(result.description).toEqual('name')
        expect(result.releaseType).toEqual('PATCH')
    })

    it('Date is passed back correctly', () => {
        const [result] = formatReleases(makeReleases([{ name: '1.0.0', createdAt: '1000' }]))
        expect(result.date).toEqual('1000')
    })

    it('With each release type', () => {
        const result = formatReleases(makeReleases([
            { name: '1.0.0' },
            { name: '1.1.0' },
            { name: '1.1.1' },
            { name: '5.0.0-alpha.7' },
        ]))

        const expected = [
            {
                date: '2020',
                description: '1.0.0',
                releaseType: 'MAJOR',
            },
            {
                date: '2020',
                description: '1.1.0',
                releaseType: 'MINOR',

            },
            {
                date: '2020',
                description: '1.1.1',
                releaseType: 'PATCH',

            },
            {
                date: '2020',
                description: '5.0.0-alpha.7',
                releaseType: 'PATCH',

            },
        ]
        expect(result).toEqual(expected)
    })
})