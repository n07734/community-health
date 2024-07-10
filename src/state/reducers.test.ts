import { vi } from 'vitest'
import types from './types'
import reducers from './reducers'
import { InferAnyAType } from 'ramda'

vi.mock('redux', () => ({
    combineReducers: (x:any) => x,
}))


const basicReducers = ({ parent, key, type }:any) => {
    it(`${key}`, () => {
        const reducer = parent[key]

        expect(reducer('foo', {
            type: types[type],
            payload: 'bar',
        })).toEqual('bar')

        expect(reducer('foo', {})).toEqual('foo')
    })
}

const paginationReducers = ({ parent, key, type }:any) => {
    it(`${key}`, () => {
        const reducer = parent[key]

        expect(reducer('foo', {
            type: types[type],
            payload: { cursor: 'bar' },
        })).toEqual({ cursor: 'bar' })

        expect(reducer('foo', {})).toEqual('foo')
    })
}

describe('reducers: ', () => {
    describe('fetches: ', () => {
        const fetches = (reducers as any).fetches

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
            const fetches = (reducers as any).fetches.prPagination
            expect(fetches({}, {
                type: types.SET_PR_PAGINATION,
                payload: { cursor: 'bar' },
            })).toEqual({ cursor: 'bar' })

            expect(fetches({cursor: 'bar' }, {
                type: types.SET_PR_PAGINATION,
                payload: { cursor: 'baz' },
            })).toEqual({ cursor: 'baz' })
        })
    })

    it('error', () => {
        const error = (reducers as any).error

        expect(error('foo', {
            type: types.FETCH_ERROR,
            payload: 'bar',
        })).toEqual('bar')

        expect(error('foo', {})).toEqual('foo')
    })

    it('fetching', () => {
        const fetching = (reducers as any).fetching

        expect(fetching('foo', {
            type: types.FETCH_START,
        })).toEqual(true)

        expect(fetching('foo', {
            type: types.FETCH_END,
        })).toEqual(false)

        expect(fetching(false, {})).toEqual(false)
    })

    it('pullRequests', () => {
        const pullRequests = (reducers as any).pullRequests

        expect(pullRequests([1, 2], {})).toEqual([1, 2])
        expect(pullRequests([1, 2], { type: types.CLEAR_PRS })).toEqual([])
        expect(pullRequests(
            [1, 2],
            {
                type: types.ADD_PRS,
                payload: [3,4],
            },
        )).toEqual([3,4]) // replaces PRs
    })

    it('issues', () => {
        const issues = (reducers as any).issues

        expect(issues([1, 2], {})).toEqual([1, 2])
        expect(issues([1, 2], { type: types.CLEAR_ISSUES })).toEqual([])
        expect(issues(
            [1, 2],
            {
                type: types.ADD_ISSUES,
                payload: [3, 4],
            },
        )).toEqual([3, 4]) // replaces issues
    })

    it('releases', () => {
        const releases = (reducers as any).releases

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
        )).toEqual([3, 4])
    })
})
