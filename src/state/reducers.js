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
        org: (org = '', action) => {
            const newValue = ({
                [types.STORE_ORG]: () => action.payload,
                [types.CLEAR_ORG]: () => '',
            })[action.type]

            return newValue
                ? newValue()
                : org
        },
        repo: (repo = '', action) => {
            const newValue = ({
                [types.STORE_REPO]: () => action.payload,
                [types.CLEAR_REPO]: () => '',
            })[action.type]

            return newValue
                ? newValue()
                : repo
        },
        teamName: (teamName = '', action) => {
            const newValue = ({
                [types.SET_TEAM_NAME]: () => action.payload,
                [types.CLEAR_TEAM_NAME]: () => '',
            })[action.type]

            return newValue
                ? newValue()
                : teamName
        },
        untilDate: (untilDate = '', action) => (action.type === types.STORE_UNTIL_DATE)
            ? action.payload
            : untilDate,
        amountOfData: (amountOfData = 1, action) => (action.type === types.STORE_AMOUNT)
            ? action.payload
            : amountOfData,
        sortDirection: (sortDirection = 'DESC', action) => (action.type === types.STORE_SORT)
            ? action.payload
            : sortDirection,
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
    formUntilDate: (formUntilDate = '', action) => (action.type === types.STORE_FORM_UNTIL_DATE)
        ? action.payload
        : formUntilDate,
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
    preFetchedName: (name = '', action) => {
        const newValue = ({
            [types.PREFETCHED_NAME]: () => action.payload,
            [types.CLEAR_PRS]: () => '',
        })[action.type]

        return newValue
            ? newValue()
            : name
    },
    pullRequests: (prs = [], action) => [
        action.type === types.ADD_PRS
            && action.payload,
        action.type === types.CLEAR_PRS && [],
        prs,
    ].find(Boolean),
    filteredPRs: (prs = [], action) => [
        action.type === types.ADD_FILTERED_PRS
            && action.payload,
        action.type === types.CLEAR_FILTERED_PRS && [],
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
