import {
    assoc,
    dissocPath,
    path,
    pickAll,
    pipe
} from 'ramda'
import api from '../api/api'
import {
    formatPullRequests,
    formatIssues,
    formatReleases,
    formatRepoInfo,
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
    dispatch({ type: types.CLEAR_PR_PAGINATION })
    dispatch({ type: types.CLEAR_REPO_INFO })
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

const formatApiRepoInfo = ({ fetches: { repo, org, description = '' } = {} } = {} ) => ({
    repo,
    org,
    description,
})

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
const getAPIData = ({ appendData = false, } = {}) => async (dispatch, getState) => {
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

    state.preFetchedRepo
        && !appendData
        && clearData(dispatch, 'pre api')

    try {
        const {
            fetches,
        } = getState();

        const { fetchInfo, results } = await api(fetches)(batchedQuery);

        const prs = formatPullRequests(results);
        const repoInfo = formatRepoInfo(results);
        const releases = formatReleases(results);
        const issues = formatIssues(results);

        dispatch({
            type: types.ADD_PRS,
            payload: prs,
        })

        dispatch({
            type: types.ADD_REPO_INFO,
            payload: repoInfo,
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

const getPreFetchedData = (repo = 'nivo') => (dispatch) => {
    const repoData = require(`../prefetchedData/${repo}.json`)

    const {
        fetches = {},
        preFetchedRepo = '',
        pullRequests = [],
        usersData= [],
        issues = [],
        releases = [],
    } = repoData

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
        type: types.PREFETCHED_REPO,
        payload: preFetchedRepo,
    })

    dispatch({
        type: types.ADD_REPO_INFO,
        payload: formatApiRepoInfo(repoData),
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
    const getReportData = pipe(
        pickAll(['fetches', 'repoInfo', 'pullRequests', 'userData', 'issues', 'releases']),
        dissocPath(['fetches', 'token']),
        dissocPath(['fetches', 'amountOfData']),
        dissocPath(['fetches', 'prPagination', 'hasNextPage']),
        dissocPath(['fetches', 'issuesPagination', 'hasNextPage']),
        dissocPath(['fetches', 'releasesPagination', 'hasNextPage']),
        assoc('preFetchedRepo', repo),
        slimObject
    )

    const reportData = getReportData(state)
    const json = JSON.stringify(reportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const href  = URL.createObjectURL(blob)

    return {
        href,
        download: `${path(['fetches', 'org'], state)}-${repo}.json`,
    }
}

export {
    setUser,
    clearUser,
    storeOrg,
    storeToken,
    storeRepo,
    storeEnterpriseAPI,
    storeAmountOfData,
    storeSortDirection,
    getAPIData,
    getPreFetchedData,
    toggleTheme,
    getDownloadProps,
}
