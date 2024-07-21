import { combineReducers } from 'redux'
import types from './types'
import { AnyForNow } from '../types/State'

const setClear = <T>(startValue: T) =>
    (storeKey: string, clearKey: string) =>
        (current = startValue, action: { type: string, payload: T }):T =>
            {
                const newValue = ({
                    [types[storeKey]]: () => action.payload,
                    [types[clearKey]]: () => startValue,
                })[action.type]

                return newValue
                    ? newValue()
                    : current
            }

const setClearString = setClear<string>('')
const setClearArray = setClear<AnyForNow[]>([])
const setClearObject = setClear<object>({})
const setClearPagination = setClear({ hasNextPage: true })

const reducers = combineReducers({
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
        usersInfo: setClearObject('STORE_USERS_INFO', 'CLEAR_USERS_INFO'),
        excludeIds: setClearArray('STORE_EX_IDS', 'CLEAR_EX_IDS'),
        events: setClearArray('STORE_EVENTS', 'CLEAR_EVENTS'),
        prPagination: setClearPagination('SET_PR_PAGINATION', 'CLEAR_PR_PAGINATION'),
        usersReviewsPagination: setClearPagination('SET_PR_REVIEWED_PAGINATION', 'CLEAR_PR_REVIEWED_PAGINATION'),
        releasesPagination: setClearPagination('SET_RELEASES_PAGINATION', 'CLEAR_RELEASES_PAGINATION'),
        issuesPagination: setClearPagination('SET_ISSUES_PAGINATION', 'CLEAR_ISSUES_PAGINATION'),
    }),
    reportDescription: setClearString('SET_DESC', 'CLEAR_DESC'),
    formUntilDate: setClearString('STORE_FORM_UNTIL_DATE', 'CLEAR_FORM_UNTIL_DATE'),
    fetching: (fetching = false, action) => {
        const {
            FETCH_START,
            FETCH_END,
        } = types
        const typeMap = {
            [FETCH_START]: true,
            [FETCH_END]: false,
        }

        return [FETCH_START,FETCH_END].includes(action.type)
            ? typeMap[action.type]
            : fetching
    },
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
    reviewedPullRequests: (prs = [], action) => [
        action.type === types.ADD_REVIEWED_PRS
            && action.payload,
        action.type === types.CLEAR_REVIEWED_PRS && [],
        prs,
    ].find(Boolean),
    itemsDateRange: (dates = ['',''], action) => [
        action.type === types.ADD_ITEMS_DATE_RANGE
            && action.payload,
        action.type === types.CLEAR_ITEMS_DATE_RANGE && ['',''],
        dates,
    ].find(Boolean),
    // trimmedItems are PRs and issues temporarily moved out of their main state when the user is changing the date slider
    trimmedItems: (items = {}, action) => [
        action.type === types.ADD_TRIMMED_ITEMS
            && action.payload,
        action.type === types.CLEAR_TRIMMED_ITEMS && {},
        items,
    ].find(Boolean),
    // filteredPRs are PRs outside of the date range of the new report data request
    filteredPRs: (filteredPRs = [], action) => [
        action.type === types.ADD_FILTERED_PRS
            && action.payload,
        action.type === types.CLEAR_FILTERED_PRS && [],
        filteredPRs,
    ].find(Boolean),
    filteredReviewedPRs: (filteredReviewedPRs = [], action) => [
        action.type === types.ADD_REVIEWED_FILTERED_PRS
            && action.payload,
        action.type === types.CLEAR_REVIEWED_FILTERED_PRS && [],
        filteredReviewedPRs,
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
            && action.payload,
        action.type === types.CLEAR_RELEASES && [],
        releases,
    ].find(Boolean),
    filteredReleases: (filteredReleases = [], action) => [
        action.type === types.ADD_FILTERED_RELEASES
            && action.payload,
        action.type === types.CLEAR_FILTERED_RELEASES && [],
        filteredReleases,
    ].find(Boolean),
})

export default reducers
