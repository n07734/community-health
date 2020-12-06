import api from '../api/api'

import {
    formatPullRequests,
    formatIssues,
    formatReleases,
} from '../format/rawData'

import {
    batchedQuery,
} from '../api/queries'

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
    dispatch({ type: types.CLEAR_USER })
    dispatch({ type: types.CLEAR_PRS })
    dispatch({ type: types.CLEAR_REPO_INFO })
    dispatch({ type: types.CLEAR_USERS_DATA })
    dispatch({ type: types.CLEAR_RELEASES })
    dispatch({ type: types.CLEAR_ISSUES })
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

const formatApiRepoInfo = ({ fetches: { repo, org, description = '' } = {}, sdlc = '' } = {} ) => ({
    repo,
    org,
    description,
    sdlc,
})

const getAPIData = () => (dispatch, getState) => {
    const state = getState()

    dispatch({
        type: types.FETCH_START,
    })

    state.preFetchedRepo
        && clearData(dispatch)

    return api(state)(batchedQuery)(dispatch)
        .then((rawData) => {
            dispatch({ type: types.FETCH_END })

            dispatch({
                type: types.ADD_PRS,
                payload: formatPullRequests(rawData),
            })

            dispatch({
                type: types.ADD_REPO_INFO,
                payload: formatApiRepoInfo(rawData),
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
        preFetchedRepo = '',
        pullRequests = [],
        usersData= [],
        issues = [],
        releases = [],
    } = repoData

    clearData(dispatch)

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

export {
    setUser,
    clearUser,
    storeOrg,
    storeToken,
    storeRepo,
    getAPIData,
    getPreFetchedData,
    toggleTheme,
}