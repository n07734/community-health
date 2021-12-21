import types from './types'

jest.mock('redux', () => ({
    combineReducers: x => x,
}))

const reducers = require('./reducers').default

const basicReducers = ({ parent, key, type }) => {
    it(`${key}`, () => {
        const reducer = parent[key]

        expect(reducer('foo', {
            type: types[type],
            payload: 'bar',
        })).toEqual('bar')

        expect(reducer('foo', {})).toEqual('foo')
    })
}

const paginationReducers = ({ parent, key, type }) => {
    it(`${key}`, () => {
        const reducer = parent[key]

        expect(reducer('foo', {
            type: types[type],
            payload: { cursor: 'bar' },
        })).toEqual({cursor: 'bar', newest: 'bar'})

        expect(reducer('foo', {})).toEqual('foo')
    })
}

describe('reducers: ', () => {
    it('user', () => {
        const user = reducers.user

        expect(user('foo', {
            type: types.SET_USER,
            payload: 'bar',
        })).toEqual('bar')

        expect(user('foo', {
            type: types.CLEAR_USER,
        })).toEqual('')

        expect(user('foo', {})).toEqual('foo')
    })

    describe('fetches: ', () => {
        const fetches = reducers.fetches

        const tests = [
            {
                parent: fetches,
                key: 'token',
                type: types.STORE_TOKEN,
            },
            {
                parent: fetches,
                key: 'org',
                type: types.STORE_ORG,
            },
            {
                parent: fetches,
                key: 'repo',
                type: types.STORE_REPO,
            },
        ]

        tests
            .forEach(basicReducers)

        const testsPagination = [
            {
                parent: fetches,
                key: 'prPagination',
                type: types.SET_PR_PAGINATION,
            },
            {
                parent: fetches,
                key: 'releasesPagination',
                type: types.SET_RELEASES_PAGINATION,
            },
            {
                parent: fetches,
                key: 'issuesPagination',
                type: types.SET_ISSUES_PAGINATION,
            },
        ]

        testsPagination
            .forEach(paginationReducers)

        it('pagination keeps newest cursor', () => {
            const fetches = reducers.fetches.prPagination
            expect(fetches({}, {
                type: types.SET_PR_PAGINATION,
                payload: { cursor: 'bar' },
            })).toEqual({cursor: 'bar', newest: 'bar'})

            expect(fetches({cursor: 'bar', newest: 'bar'}, {
                type: types.SET_PR_PAGINATION,
                payload: { cursor: 'baz' },
            })).toEqual({cursor: 'baz', newest: 'bar'})
        })
    })

    it('error', () => {
        const error = reducers.error

        expect(error('foo', {
            type: types.FETCH_ERROR,
            payload: 'bar',
        })).toEqual('bar')

        expect(error('foo', {})).toEqual('foo')
    })

    it('fetching', () => {
        const fetching = reducers.fetching

        expect(fetching('foo', {
            type: types.FETCH_START,
        })).toEqual(true)

        expect(fetching('foo', {
            type: types.FETCH_END,
        })).toEqual(false)

        expect(fetching(false, {})).toEqual(false)
    })

    it('pullRequests', () => {
        const pullRequests = reducers.pullRequests

        expect(pullRequests([1, 2], {})).toEqual([1, 2])
        expect(pullRequests([1, 2], { type: types.CLEAR_PRS })).toEqual([])
        expect(pullRequests(
            [1, 2],
            {
                type: types.ADD_PRS,
                payload: [3,4],
            },
        )).toEqual([1,2,3,4])
    })

    it('issues', () => {
        const issues = reducers.issues

        expect(issues([1, 2], {})).toEqual([1, 2])
        expect(issues([1, 2], { type: types.CLEAR_ISSUES })).toEqual([])
        expect(issues(
            [1, 2],
            {
                type: types.ADD_ISSUES,
                payload: [3, 4],
            },
        )).toEqual([1, 2, 3, 4])
    })

    it('releases', () => {
        const releases = reducers.releases

        expect(releases([1, 2], {})).toEqual([1, 2])
        expect(releases([1, 2], {
            type: types.CLEAR_RELEASES,
        })).toEqual([])
        expect(releases(
            [1, 2],
            {
                type: types.ADD_RELEASES,
                payload: [3, 4],
            },
        )).toEqual([1, 2, 3, 4])
    })


    it('themeType', () => {
        const themeType = reducers.themeType

        expect(themeType('dark', {})).toEqual('dark')
        expect(themeType('light', {
            type: types.TOGGLE_THEME,
        })).toEqual('dark')
        expect(themeType('dark', {
            type: types.TOGGLE_THEME,
        })).toEqual('light')
    })
})
