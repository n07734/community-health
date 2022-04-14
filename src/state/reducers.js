import { combineReducers } from 'redux'
import types from './types'

const reducers = combineReducers({
    user: (user = '', action) => {
        const newValue = ({
            [types.SET_USER]: () => action.payload,
            [types.CLEAR_USER]: () => '',
        })[action.type]

        return newValue
            ? newValue()
            : user
    },
    fetches: combineReducers({
        token: (token = '', action) => (action.type === types.STORE_TOKEN)
            ? action.payload
            : token,
        org: (org = '', action) => (action.type === types.STORE_ORG)
            ? action.payload
            : org,
        repo: (repo = '', action) => (action.type === types.STORE_REPO)
            ? action.payload
            : repo,
        teamName: (teamName = '', action) => {
            const newValue = ({
                [types.SET_TEAM_NAME]: () => action.payload,
                [types.CLEAR_TEAM_NAME]: () => '',
            })[action.type]

            return newValue
                ? newValue()
                : teamName
        },
        amountOfData: (amountOfData = 1, action) => (action.type === types.STORE_AMOUNT)
            ? action.payload
            : amountOfData,
        enterpriseAPI: (enterpriseAPI = '', action) => (action.type === types.STORE_ENT_URL)
            ? action.payload
            : enterpriseAPI,
        userIds: (userIds = [], action) => (action.type === types.STORE_USER_IDS)
            ? action.payload
            : userIds,
        excludeIds: (excludeIds = [], action) => (action.type === types.STORE_EX_IDS)
            ? action.payload
            : excludeIds,
        prPagination: (pagination = { hasNextPage: true }, action) => ({
            [types.SET_PR_PAGINATION]: action.payload,
            [types.CLEAR_PR_PAGINATION]: { hasNextPage: true },
        })[action.type] || pagination,
        releasesPagination: (pagination = { hasNextPage: true }, action) => ({
            [types.SET_RELEASES_PAGINATION]: action.payload,
            [types.CLEAR_RELEASES_PAGINATION]: { hasNextPage: true },
        })[action.type] || pagination,
        issuesPagination: (pagination = { hasNextPage: true }, action) => ({
            [types.SET_ISSUES_PAGINATION]: action.payload,
            [types.CLEAR_ISSUES_PAGINATION]: { hasNextPage: true },
        })[action.type] || pagination,
    }),
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
    error: (error = '', action) => {
        const newValue = ({
            [types.FETCH_ERROR]: () => action.payload,
            [types.CLEAR_FETCH_ERROR]: () => '',
        })[action.type]

        return newValue
            ? newValue()
            : error
    },
    preFetchedRepo: (repo = '', action) => {
        const newValue = ({
            [types.PREFETCHED_REPO]: () => action.payload,
            [types.CLEAR_PRS]: () => '',
        })[action.type]

        return newValue
            ? newValue()
            : repo
    },
    repoInfo: (repoInfo = {}, action) => [
        action.type === types.ADD_REPO_INFO
            && action.payload,
        action.type === types.CLEAR_REPO_INFO
            && {},
        repoInfo,
    ].find(Boolean),
    pullRequests: (prs = [], action) => [
        action.type === types.ADD_PRS
            && prs.concat(action.payload),
        action.type === types.CLEAR_PRS && [],
        prs,
    ].find(Boolean),
    usersData: (users = [], action) => [
        action.type === types.ADD_USERS_DATA
            && action.payload,
        action.type === types.CLEAR_USERS_DATA && [],
        users,
    ].find(Boolean),
    issues: (issues = [], action) => [
        action.type === types.ADD_ISSUES
            && issues.concat(action.payload),
        action.type === types.CLEAR_ISSUES && [],
        issues,
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
