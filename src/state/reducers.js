import { combineReducers } from 'redux'
import types from './types'

const setClear = startValue => (storKey, clearKey) => (current = startValue, action) => {
    const newValue = ({
        [types[storKey]]: () => action.payload,
        [types[clearKey]]: () => startValue,
    })[action.type]

    return newValue
        ? newValue()
        : current
}

const setClearString = setClear('')
const setClearArray = setClear([])
const setClearPagination = setClear({ hasNextPage: true })

const reducers = combineReducers({
    user: setClearString('SET_USER', 'CLEAR_USER'),
    pvp: (pvp = false, action) => [
        action.type === types.SET_PVP
            && (() => true),
        action.type === types.CLEAR_PVP
            && (() => false),
        () => pvp,
    ]
        .find(Boolean)(),
    fetches: combineReducers({
        token: (token = '', action) => (action.type === types.STORE_TOKEN)
            ? action.payload
            : token,
        org: setClearString('STORE_ORG', 'CLEAR_ORG'),
        repo: setClearString('STORE_REPO', 'CLEAR_REPO'),
        teamName: setClearString('SET_TEAM_NAME', 'CLEAR_TEAM_NAME'),
        untilDate: setClearString('STORE_UNTIL_DATE', 'CLEAR_UNTIL_DATE'),
        amountOfData: (amountOfData = 1, action) => (action.type === types.STORE_AMOUNT)
            ? action.payload
            : amountOfData,
        sortDirection: (sortDirection = 'DESC', action) => (action.type === types.STORE_SORT)
            ? action.payload
            : sortDirection,
        enterpriseAPI: (enterpriseAPI = '', action) => (action.type === types.STORE_ENT_URL)
            ? action.payload
            : enterpriseAPI,
        userIds: setClearArray('STORE_USER_IDS', 'CLEAR_USER_IDS'),
        excludeIds: setClearArray('STORE_EX_IDS', 'CLEAR_EX_IDS'),
        prPagination: setClearPagination('SET_PR_PAGINATION', 'CLEAR_PR_PAGINATION'),
        releasesPagination: setClearPagination('SET_RELEASES_PAGINATION', 'CLEAR_RELEASES_PAGINATION'),
        issuesPagination: setClearPagination('SET_ISSUES_PAGINATION', 'CLEAR_ISSUES_PAGINATION'),
    }),
    reportDescription: setClearString('SET_DESC', 'CLEAR_DESC'),
    formUntilDate: setClearString('STORE_FORM_UNTIL_DATE', 'CLEAR_FORM_UNTIL_DATE'),
    fetching: (fetching = false, action) => [
        action.type === types.FETCH_START
            && (() => true),
        action.type === types.FETCH_END
            && (() => false),
        () => fetching,
    ]
        .find(Boolean)(),
    fetchStatus: (fetchStatus = {}, action) => action.type === types.FETCH_STATUS
        ? action.payload
        : fetchStatus,
    error: setClearString('FETCH_ERROR', 'CLEAR_FETCH_ERROR'),
    preFetchedError: setClearString('PRE_FETCH_ERROR', 'CLEAR_PRE_FETCH_ERROR'),
    preFetchedName: setClearString('PREFETCHED_NAME', 'CLEAR_PREFETCHED_NAME'),
    pullRequests: (prs = [], action) => [
        action.type === types.ADD_PRS
            && action.payload,
        action.type === types.CLEAR_PRS && [],
        prs,
    ].find(Boolean),
    filteredPRs: (filteredPRs = [], action) => [
        action.type === types.ADD_FILTERED_PRS
            && action.payload,
        action.type === types.CLEAR_FILTERED_PRS && [],
        filteredPRs,
    ].find(Boolean),
    usersData: (users = [], action) => [
        action.type === types.ADD_USERS_DATA
            && action.payload,
        action.type === types.CLEAR_USERS_DATA && [],
        users,
    ].find(Boolean),
    issues: (issues = [], action) => [
        action.type === types.ADD_ISSUES
            && action.payload,
        action.type === types.CLEAR_ISSUES && [],
        issues,
    ].find(Boolean),
    filteredIssues: (filteredIssues = [], action) => [
        action.type === types.ADD_FILTERED_ISSUES
            && action.payload,
        action.type === types.CLEAR_FILTERED_ISSUES && [],
        filteredIssues,
    ].find(Boolean),
    releases: (releases = [], action) => [
        action.type === types.ADD_RELEASES
            && releases.concat(action.payload),
        action.type === types.CLEAR_RELEASES && [],
        releases,
    ].find(Boolean),
    themeType: (themeType = 'dark', action) =>
        action.type === types.TOGGLE_THEME
            ? (themeType === 'dark' ? 'light' : 'dark')
            : themeType,
})

export default reducers
