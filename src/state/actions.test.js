import { vi } from 'vitest'
import types from './types'
import {
    setUser,
    clearUser,
    storeOrg,
    storeToken,
    storeRepo,
    storeUserIds,
} from './actions'
import { getAPIData } from './actions'

describe('Basic actions:', () => {
    it('setUser returns correct type', () => {
        const dispatch = vi.fn()
        setUser('USER')(dispatch)
        expect(dispatch).toHaveBeenNthCalledWith(1, {
            payload: 'USER', type: 'SET_USER',
        })
    })

    it('clearUser returns correct type', () => {
        expect(clearUser()).toEqual({
            type: types.CLEAR_USER,
        })
    })

    it('storeToken returns correct type', () => {
        expect(storeToken('TOKEN')).toEqual({
            type: types.STORE_TOKEN,
            payload: 'TOKEN',
        })
    })

    const fetchState = {
        fetches: {
            repo: 'A',
            org: 'b',
        },
    }

    it('storeOrg returns correct type', () => {
        expect(storeOrg('ORG')(x => x, () => fetchState)).toEqual({
            type: types.STORE_ORG,
            payload: 'ORG',
        })
    })

    it('storeRepo returns correct type', () => {
        expect(storeRepo('REPO')(x => x, () => fetchState)).toEqual({
            type: types.STORE_REPO,
            payload: 'REPO',
        })
    })
})

describe('getAPIData:', () => {
    vi.resetModules()
    vi.mock('../api/api', () => {
        return {
            default: ({ apiError }) => () => () => apiError
                ? Promise.reject('Oops')
                : Promise.resolve(),
        }
    })

    it('Dispatches are called in correct order when there is preFetchedName', async() => {
        const dispatch = vi.fn()
        const getState = () => ({
            fetches: {
                org: 'org',
                repo: 'repo',
                token: 'TOKEN',
            },
            preFetchedName: true,
            pullRequests: [],
        })

       await getAPIData()(dispatch, getState)

        const dispatchOrder = [
            types.CLEAR_FETCH_ERROR,
            types.FETCH_START,
            types.ADD_PRS,
            types.ADD_FILTERED_PRS,
            types.ADD_REVIEWED_PRS,
            types.ADD_REVIEWED_FILTERED_PRS,
            types.ADD_ITEMS_DATE_RANGE,
            types.ADD_USERS_DATA,
            types.ADD_RELEASES,
            types.ADD_FILTERED_RELEASES,
            types.ADD_ISSUES,
            types.ADD_FILTERED_ISSUES,
            types.STORE_UNTIL_DATE,
            types.SET_PR_PAGINATION,
            types.SET_PR_REVIEWED_PAGINATION,
            types.SET_ISSUES_PAGINATION,
            types.SET_RELEASES_PAGINATION,
            types.FETCH_END,
        ]

        const mockedCalls = dispatch.mock.calls

        dispatchOrder
            .forEach((type, i) => {
                const mocked = mockedCalls[i][0]

                let nestedAction = ''
                typeof mocked === 'function'
                    && mocked((x) => {
                        nestedAction = x.type
                    }, getState)

                const resolvedType = nestedAction || mocked.type

                expect(resolvedType).toEqual(type)
            })

        expect(dispatch).toHaveBeenCalledTimes(dispatchOrder.length)
    })

    it('Dispatches are called in correct order when there is an api error', async () => {
        const dispatch = vi.fn()
        const getState = () => ({
            fetches: {
                org: 'org',
                repo: 'repo',
            },
        })

        await getAPIData()(dispatch, getState)

        const dispatchOrder = [
            types.FETCH_ERROR,
            types.FETCH_END,
        ]

        const mockedCalls = dispatch.mock.calls

        dispatchOrder
            .forEach((type, i) => {
                expect(mockedCalls[i][0].type).toEqual(type)
            })

        expect(dispatch).toHaveBeenCalledTimes(dispatchOrder.length)
    })
})

describe('storeUserIds:', () => {
    test.each([
        [ 'userName', ['userName'], {}],
        [
            'userName1=end:2023-12-12,userName2=start:2020-12-12',
            ['userName1', 'userName2'],
        ],
        [
            'userName4=start:2020-12-12;end:2021|start:2022-12-12,userName5',
            ['userName4', 'userName5'],
        ],
      ])('input %i', (input, userIds) => {
        const dispatch = vi.fn()
        storeUserIds(input)(dispatch)

        expect(dispatch).toHaveBeenCalledWith({
            payload: userIds, type: 'STORE_USER_IDS',
        })
      })
})
