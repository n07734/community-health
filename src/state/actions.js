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

const clearData = (dispatch) => {
    console.log('-=-=--clear data')
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

const getAPIData = ({ appendData = false, order = 'DESC' } = {}) => (dispatch, getState) => {
    console.log('-=-=--getAPIData', appendData, order )
    const state = getState()

    dispatch({
        type: types.FETCH_START,
    })

    console.log('-=-=-- state.preFetchedRepo', state.preFetchedRepo)
    console.log('-=-=--appendData', appendData)

    state.preFetchedRepo
        && !appendData
        && clearData(dispatch)

    return api(getState())(batchedQuery(order))(dispatch)
        .then((rawData) => {
            dispatch({ type: types.FETCH_END })

            dispatch({
                type: types.ADD_PRS,
                payload: formatPullRequests(rawData),
            })

            dispatch({
                type: types.ADD_REPO_INFO,
                payload: formatRepoInfo(rawData),
            })

            dispatch(updateUsersData)

            dispatch({
                type: types.ADD_RELEASES,
                payload: formatReleases(rawData),
            })

            dispatch({
                type: types.ADD_ISSUES,
                payload: formatIssues(rawData),
            })
        })
        .catch((error = {}) => {
            dispatch({
                type: types.FETCH_ERROR,
                payload: {
                    level: 'error',
                    message: error.message || 'Unknown error',
                },
            })
            dispatch({ type: types.FETCH_END })
        })
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
    getAPIData,
    getPreFetchedData,
    toggleTheme,
    getDownloadProps,
}
