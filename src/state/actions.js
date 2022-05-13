import {
    assoc,
    dissocPath,
    equals,
    filter,
    not,
    map,
    path,
    pickAll,
    pipe,
    split,
    trim,
    propOr,
} from 'ramda'
import api from '../api/api'
import getUsersData from '../api/getUsersData'
import getUntilDate from '../api/getUntilDate'
import {
    formatPullRequests,
    formatIssues,
    formatReleases,
} from '../format/rawData'
import { slimObject } from '../format/lightenData'
import { batchedQuery } from '../api/queries'
import formatUserData from '../format/userData'
import types from './types'

const setUser = (user = '') => ({
    type: types.SET_USER,
    payload: user,
})

const toggleTheme = () => ({
    type: types.TOGGLE_THEME,
})

const clearUser = () => ({
    type: types.CLEAR_USER,
})

const storeToken = (token = '') => ({
    type: types.STORE_TOKEN,
    payload: token,
})

const storeOrg = (org = '') => (dispatch, getState) => {
    const {
        fetches: {
            org: currentOrg,
        },
    } = getState()

    org && currentOrg && org !== currentOrg
        && clearData(dispatch)

    return dispatch({
        type: types.STORE_ORG,
        payload: org,
    })
}

const storeEnterpriseAPI = (enterpriseAPI = '') => (dispatch, getState) => {
    const {
        fetches: {
            enterpriseAPI: currentEnterpriseAPI
        },
    } = getState()

    enterpriseAPI && currentEnterpriseAPI && enterpriseAPI !== currentEnterpriseAPI
        && clearData(dispatch)

    return dispatch({
        type: types.STORE_ENT_URL,
        payload: enterpriseAPI,
    })
}

const storeTeamName = (teamName = '') => (dispatch, getState) => {
    const {
        fetches: {
            teamName: currentTeamName
        },
    } = getState()

    teamName && currentTeamName && teamName !== currentTeamName
        && clearData(dispatch)

    return dispatch({
        type: types.SET_TEAM_NAME,
        payload: teamName,
    })
}

const userIdsFromString = pipe(
    split(','),
    map(trim),
    filter(Boolean)
)

const storeUserIds = (userIds = '') => (dispatch, getState) => {
    const userIdsArray = userIdsFromString(userIds)

    const {
        fetches: {
            userIds: currentUserIds = []
        },
    } = getState()

    not(equals(currentUserIds, userIdsArray))
        && clearData(dispatch)

    return dispatch({
        type: types.STORE_USER_IDS,
        payload: userIdsArray,
    })
}

const storeExcludeIds = (excludeIds = '') => (dispatch, getState) => {
    const excludeArray = userIdsFromString(excludeIds)

    const {
        fetches: {
            excludeIds: currentExcludeIds
        },
    } = getState()

    excludeArray.length && not(equals(currentExcludeIds, excludeArray))
        && clearData(dispatch)

    return dispatch({
        type: types.STORE_EX_IDS,
        payload: excludeArray,
    })
}

const storeRepo = (repo = '') => (dispatch, getState) => {
    const {
        fetches: {
            repo: currentRepo,
        },
    } = getState()

    repo && currentRepo && repo !== currentRepo
        && clearData(dispatch)

    return dispatch({
        type: types.STORE_REPO,
        payload: repo,
    })
}

const storeAmountOfData = (amountOfData = '') => (dispatch) => dispatch({
    type: types.STORE_AMOUNT,
    payload: amountOfData,
})

const storeSortDirection = (sortDirection = 'DESC') => (dispatch) => dispatch({
    type: types.STORE_SORT,
    payload: sortDirection,
})

const clearData = (dispatch, msg = 'fff') => {
    dispatch({ type: types.CLEAR_USER })
    dispatch({ type: types.CLEAR_PRS })
    dispatch({ type: types.CLEAR_FILTERED_PRS })
    dispatch({ type: types.CLEAR_PR_PAGINATION })
    dispatch({ type: types.CLEAR_USERS_DATA })
    dispatch({ type: types.CLEAR_RELEASES })
    dispatch({ type: types.CLEAR_RELEASES_PAGINATION })
    dispatch({ type: types.CLEAR_ISSUES })
    dispatch({ type: types.CLEAR_ISSUES_PAGINATION })
    dispatch({ type: types.CLEAR_FETCH_ERROR })
}

// Hmm: full users format per new pr results
const updateUsersData = (dispatch, getState) => {
    const { pullRequests } = getState()

    dispatch({
        type: types.ADD_USERS_DATA,
        payload: formatUserData(pullRequests),
    })
}

const getErrorMessage = state => {
    const {
        fetches: {
            org,
            repo,
            token,
        } = {},
    } = state

    const missing = [
        !org && 'Organisation',
        !repo && 'Repository',
        !token &&'GitHib token',
    ]
        .filter(Boolean)

    const prepend = (i) => {
        const maxIndex = missing.length - 1

        return [
            i === 0
            && (() => 'Missing '),
            i === maxIndex
            && (() => ' and '),
            i > 0
            && (() => ', '),
        ].find(Boolean)()
    }

    const message = missing
        .reduce((acc, current, i) => acc + prepend(i) + current, '')

    return message
}

const validateRequest = state => {
    const {
        fetches: {
            org,
            repo,
            token,
        } = {},
    } = state

    const hasArgs = [org, repo, token]
        .every(item => typeof item === 'string' && item.length > 0)

    return {
        isValid: hasArgs,
        error: !hasArgs
            ? {
                level: 'error',
                message: getErrorMessage(state),
            }
            : null,
    }
}

// TODO: Improve clearData logic
const getAPIData = ({ appendData = false } = {}) => async (dispatch, getState) => {
    const state = getState();

    const { isValid: isValidRequest, error = {}} = validateRequest(state);

    !isValidRequest && dispatch({
        type: types.FETCH_ERROR,
        payload: error,
    })

    isValidRequest && dispatch({
        type: types.CLEAR_FETCH_ERROR,
    })

    isValidRequest && dispatch({
        type: types.FETCH_START,
    })

    state.preFetchedName
        && !appendData
        && clearData(dispatch, 'pre api')

    try {
        const {
            fetches,
            pullRequests,
        } = getState();
        const userIds = propOr([], 'userIds', fetches)

        const untilDate = getUntilDate(fetches, pullRequests)

        const { fetchInfo, results } = userIds.length
            ? await getUsersData({ fetchInfo: fetches, untilDate, dispatch })
            : await api({ fetchInfo: fetches, queryInfo: batchedQuery(untilDate), dispatch })

        const [remainingPRs, filteredPRs] = formatPullRequests(fetches, untilDate, results)
        const releases = formatReleases(results)
        const issues = formatIssues(results)

        dispatch({
            type: types.ADD_PRS,
            payload: remainingPRs,
        })

        dispatch({
            type: types.ADD_FILTERED_PRS,
            payload: filteredPRs,
        })

        dispatch(updateUsersData)

        dispatch({
            type: types.ADD_RELEASES,
            payload: releases,
        })

        dispatch({
            type: types.ADD_ISSUES,
            payload: issues,
        })

        dispatch({
            type: types.SET_PR_PAGINATION,
            payload: fetchInfo.prPagination,
        })

        dispatch({
            type: types.SET_ISSUES_PAGINATION,
            payload: fetchInfo.issuesPagination,
        })

        dispatch({
            type: types.SET_RELEASES_PAGINATION,
            payload: fetchInfo.releasesPagination,
        })

        dispatch({ type: types.FETCH_END })

    } catch (error) {
        console.log('-=-=--api data error', error)
        dispatch({
            type: types.FETCH_ERROR,
            payload: {
                level: 'error',
                message: error.message || 'Unknown error',
            },
        })
        dispatch({ type: types.FETCH_END })
    }
}

const getPreFetchedData = (name = 'nivo') => (dispatch, getState) => {
    const repoData = require(`../prefetchedData/${name}.json`)

    const {
        fetches = {},
        preFetchedName = '',
        pullRequests = [],
        usersData= [],
        issues = [],
        releases = [],
    } = repoData

    const teamName = fetches.teamName || ''
    const userIds = fetches.userIds || []

    clearData(dispatch)

    const fetchesInfo = [
        ['token', 'STORE_TOKEN'],
        ['org', 'STORE_ORG'],
        ['repo', 'STORE_REPO'],
        ['enterpriseAPI', 'STORE_ENT_URL'],
        ['prPagination', 'SET_PR_PAGINATION', {}],
        ['releasesPagination', 'SET_RELEASES_PAGINATION', {}],
        ['issuesPagination', 'SET_ISSUES_PAGINATION', {}]
    ];

    fetchesInfo.forEach(([payload, type, fallback = '']) => {
        dispatch({
            type: types[type],
            payload: fetches[payload] || fallback,
        })
    });

    dispatch({
        type: types.PREFETCHED_NAME,
        payload: preFetchedName,
    })

    dispatch({
        type: types.SET_TEAM_NAME,
        payload: teamName,
    })

    dispatch({
        type: types.STORE_USER_IDS,
        payload: userIds,
    })

    dispatch({
        type: types.ADD_PRS,
        payload: pullRequests,
    })
    dispatch({
        type: types.ADD_USERS_DATA,
        payload: usersData.length
            ? usersData
            : formatUserData(pullRequests),
    })

    dispatch({
        type: types.ADD_ISSUES,
        payload: issues,
    })

    dispatch({
        type: types.ADD_RELEASES,
        payload: releases,
    })

    dispatch({
        type: types.FETCH_END,
    })
}

const getDownloadProps = (dispatch, getState) => {
    const state = getState()

    const repo = path(['fetches', 'repo'], state)
    const teamName = path(['fetches', 'teamName'], state)
    const getReportData = pipe(
        pickAll(['fetches', 'pullRequests', 'userData', 'issues', 'releases', 'teamName']),
        dissocPath(['fetches', 'token']),
        dissocPath(['fetches', 'amountOfData']),
        // TODO: strip hasNextPage from user's pagination data
        dissocPath(['fetches', 'prPagination', 'hasNextPage']),
        dissocPath(['fetches', 'issuesPagination', 'hasNextPage']),
        dissocPath(['fetches', 'releasesPagination', 'hasNextPage']),
        assoc('preFetchedName', repo),
        slimObject
    )

    const reportData = getReportData(state)
    const json = JSON.stringify(reportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const href  = URL.createObjectURL(blob)


    const fileName = teamName
        ? teamName
        : `${path(['fetches', 'org'], state)}-${repo}`

    return {
        href,
        download: `${fileName}.json`,
    }
}

export {
    setUser,
    clearUser,
    storeOrg,
    storeToken,
    storeRepo,
    storeTeamName,
    storeEnterpriseAPI,
    storeUserIds,
    storeExcludeIds,
    storeAmountOfData,
    storeSortDirection,
    getAPIData,
    getPreFetchedData,
    toggleTheme,
    getDownloadProps,
}
