import types from './types'

describe('Basic actions:', () => {
    const {
        setUser,
        clearUser,
        storeOrg,
        storeToken,
        storeRepo,
        toggleTheme,
    } = require('./actions')

    it('setUser returns correct type', () => {
        expect(setUser('USER')).toEqual({
            type: types.SET_USER,
            payload: 'USER',
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

    it('toggleTheme returns correct type', () => {
        expect(toggleTheme()).toEqual({
            type: types.TOGGLE_THEME,
        })
    })
})

describe('getAPIData:', () => {
    jest.resetModules()
    jest.mock('../api/api', (x) => {
        return ({ apiError }) => () => () => apiError
            ? Promise.reject('Oops')
            : Promise.resolve()
    })
    const { getAPIData } = require('./actions')

    it('Dispatches are called in correct order when there is preFetchedName', async() => {
        const dispatch = jest.fn()
        const getState = () => ({
            preFetchedName: true,
            pullRequests: [],
        })

        await getAPIData()(dispatch, getState)

        const dispatchOrder = [
            types.FETCH_START,
            types.CLEAR_USER,
            types.CLEAR_PRS,
            types.CLEAR_REPORT_INFO,
            types.CLEAR_USERS_DATA,
            types.CLEAR_RELEASES,
            types.CLEAR_ISSUES,
            types.CLEAR_FETCH_ERROR,
            types.FETCH_END,
            types.ADD_PRS,
            types.ADD_REPORT_INFO,
            types.ADD_USERS_DATA,
            types.ADD_RELEASES,
            types.ADD_ISSUES,
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
        const dispatch = jest.fn()
        const getState = () => ({
            apiError: true,
        })

        await getAPIData()(dispatch, getState)

        const dispatchOrder = [
            types.FETCH_START,
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

describe('getPreFetchedData:', () => {
    const { getPreFetchedData } = require('./actions')

    it('Triggers dispatches in correct order', () => {
        const dispatch = jest.fn()
        getPreFetchedData('vue-next')(dispatch)

        const dispatchOrder = [
            types.CLEAR_USER,
            types.CLEAR_PRS,
            types.CLEAR_REPORT_INFO,
            types.CLEAR_USERS_DATA,
            types.CLEAR_RELEASES,
            types.CLEAR_ISSUES,
            types.CLEAR_FETCH_ERROR,
            types.PREFETCHED_NAME,
            types.ADD_REPORT_INFO,
            types.ADD_PRS,
            types.ADD_USERS_DATA,
            types.ADD_ISSUES,
            types.ADD_RELEASES,
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

describe('toggleTheme:', () => {
    const { toggleTheme } = require('./actions')

    it('Returns correct type', () => {
        const result = toggleTheme()
        expect(result).toEqual({ type: types.TOGGLE_THEME })
    })
})