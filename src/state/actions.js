import {
    anyPass,
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
    pick,
} from 'ramda'
import api from '../api/api'
import getUsersData from '../api/getUsersData'
import getUntilDate from '../api/getUntilDate'
import {
    formatPullRequests,
    filterSortPullRequests,
    formatIssues,
    filterSortIssues,
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

const storeOrg = (org = '') => (dispatch) => dispatch({
    type: types.STORE_ORG,
    payload: org,
})

const storeEnterpriseAPI = (enterpriseAPI = '') => (dispatch) => dispatch({
    type: types.STORE_ENT_URL,
    payload: enterpriseAPI,
})

const storeTeamName = (teamName = '') => (dispatch) => dispatch({
    type: types.SET_TEAM_NAME,
    payload: teamName,
})

const userIdsFromString = pipe(
    split(','),
    map(trim),
    filter(Boolean)
)

const storeUserIds = (userIds = '') => (dispatch) => {
    const userIdsArray = userIdsFromString(userIds)

    return dispatch({
        type: types.STORE_USER_IDS,
        payload: userIdsArray,
    })
}

const storeExcludeIds = (excludeIds = '') => (dispatch) => {
    const excludeArray = userIdsFromString(excludeIds)

    return dispatch({
        type: types.STORE_EX_IDS,
        payload: excludeArray,
    })
}

const storeRepo = (repo = '') => (dispatch) => dispatch({
    type: types.STORE_REPO,
    payload: repo,
})

const storeAmountOfData = (amountOfData = '') => (dispatch) => dispatch({
    type: types.STORE_AMOUNT,
    payload: amountOfData,
})

const storeFormUntilDate = (amountOfData = '') => (dispatch, getState) => {
    const {
        fetches  = {},
        pullRequests = [],
    } = getState();

    const formUntilDate = getUntilDate(
        {
            ...fetches,
            amountOfData
        },
        pullRequests
    )

    dispatch({
        type: types.STORE_FORM_UNTIL_DATE,
        payload: formUntilDate,
    })
}

const storeUntilDate = (untilDate = '') => (dispatch) => dispatch({
    type: types.STORE_UNTIL_DATE,
    payload: untilDate,
})

const storeSortDirection = (sortDirection = 'DESC') => (dispatch) => dispatch({
    type: types.STORE_SORT,
    payload: sortDirection,
})


const notSameStringValues = (formValues = {}) => (key = '') => (fetches = {}) =>
    formValues[key] && fetches[key] && formValues[key] !== fetches[key]
const notSameArrayValues = (formValues = {}) => (key = '') => (fetches = {}) => {
    const idsString = propOr('', key, formValues)
    const formIds = userIdsFromString(idsString)

    const currentIds = fetches[key]
    return currentIds.length && not(equals(currentIds, formIds))
}

// TODO: regression test
const clearPastSearch = (values) => (dispatch, getState) => {
    const {
        fetches = {}
    } = getState()

    const notSameValues = notSameStringValues(values)
    const notSameIds = notSameArrayValues(values)

    const isNewSearch = anyPass([
        notSameValues('org'),
        notSameValues('repo'),
        notSameValues('teamName'),
        notSameValues('enterpriseAPI'),
        notSameIds('userIds'),
        notSameIds('excludeIds'),
    ])(fetches)

    isNewSearch
        && clearData(dispatch)
}

const clearData = (dispatch) => {
    dispatch({ type: types.CLEAR_ORG })
    dispatch({ type: types.CLEAR_REPO })
    dispatch({ type: types.CLEAR_USER })
    dispatch({ type: types.CLEAR_PRS })
    dispatch({ type: types.CLEAR_FILTERED_PRS })
    dispatch({ type: types.CLEAR_PR_PAGINATION })
    dispatch({ type: types.CLEAR_PREFETCHED_NAME })
    dispatch({ type: types.CLEAR_UNTIL_DATE })
    dispatch({ type: types.CLEAR_FORM_UNTIL_DATE })
    dispatch({ type: types.CLEAR_USER_IDS })
    dispatch({ type: types.CLEAR_EX_IDS })
    dispatch({ type: types.CLEAR_USERS_DATA })
    dispatch({ type: types.CLEAR_TEAM_NAME })
    dispatch({ type: types.CLEAR_RELEASES })
    dispatch({ type: types.CLEAR_RELEASES_PAGINATION })
    dispatch({ type: types.CLEAR_ISSUES })
    dispatch({ type: types.CLEAR_FILTERED_ISSUES })
    dispatch({ type: types.CLEAR_ISSUES_PAGINATION })
    dispatch({ type: types.CLEAR_FETCH_ERROR })
    dispatch({ type: types.CLEAR_PRE_FETCH_ERROR })
}

const clearAllData = clearData

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
            userIds = [],
        } = {},
    } = state

    const noUserIds = userIds.length < 1

    const missing = [
        noUserIds && !org && 'Organization',
        noUserIds && !repo && 'Repository',
        !token &&'GitHib token',
        !org && !repo && noUserIds && 'GitHub Ids',
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
            userIds = [],
        } = {},
    } = state

    const stringArgs = userIds.length
        ? [token]
        : [org, repo, token]

    const validStringArgs = stringArgs
        .every(item => typeof item === 'string' && item.length > 0)

    const arrayArgs = userIds.length
        ? [userIds]
        : []

    const validArraygArgs = arrayArgs
        .every(item => item.length > 0)

    const isValid = validStringArgs && validArraygArgs

    return {
        isValid,
        error: !isValid
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

    try {
        const {
            fetches,
            filteredPRs = [],
            pullRequests = [],
            issues = [],
            filteredIssues = [],
            formUntilDate = '',
        } = getState();
        const userIds = propOr([], 'userIds', fetches)

        const untilDate = formUntilDate

        const { fetchInfo, results } = userIds.length
            ? await getUsersData({ fetchInfo: fetches, untilDate, dispatch })
            : await api({ fetchInfo: fetches, queryInfo: batchedQuery(untilDate), dispatch })

        const newPullrequests = formatPullRequests(fetches, results)
        // Get all prs together so then can be cleanly filtered and sorted
        const allPullrequests = pullRequests.concat(filteredPRs).concat(newPullrequests)
        const [newRemainingPRs, newFilteredPRs] = filterSortPullRequests(fetches, untilDate, allPullrequests)

        const releases = formatReleases(results)

        const newIssues = formatIssues(results)
        const allIssues = issues.concat(filteredIssues).concat(newIssues)
        const [newRemainingIssues, newFilteredIssues] = filterSortIssues(fetches, untilDate, allIssues)

        dispatch({
            type: types.ADD_PRS,
            payload: newRemainingPRs,
        })

        dispatch({
            type: types.ADD_FILTERED_PRS,
            payload: newFilteredPRs,
        })

        dispatch(updateUsersData)

        dispatch({
            type: types.ADD_RELEASES,
            payload: releases,
        })

        dispatch({
            type: types.ADD_ISSUES,
            payload: newRemainingIssues,
        })

        dispatch({
            type: types.ADD_FILTERED_ISSUES,
            payload: newFilteredIssues,
        })

        dispatch({
            type: types.STORE_UNTIL_DATE,
            payload: formUntilDate,
        })

        const pageInfo = pick(['newest', 'oldest'])
        dispatch({
            type: types.SET_PR_PAGINATION,
            payload: pageInfo(fetchInfo.prPagination),
        })

        dispatch({
            type: types.SET_ISSUES_PAGINATION,
            payload: pageInfo(fetchInfo.issuesPagination),
        })

        dispatch({
            type: types.SET_RELEASES_PAGINATION,
            payload: pageInfo(fetchInfo.releasesPagination),
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

const setPreFetchedData = (repoData = {}, dispatch) => {
    const {
        fetches = {},
        preFetchedName = '',
        pullRequests = [],
        usersData= [],
        issues = [],
        releases = [],
    } = repoData

    const {
        teamName = '',
        userIds = [],
        excludeIds = [],
    } = fetches

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
        type: types.STORE_EX_IDS,
        payload: excludeIds,
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

const parseJSON = response => new Promise((resolve, reject) => {
    response.json()
        .then(data => response.status === 200
            ? resolve(data)
            : reject(new Error(`Error status code ${response.status}`))
        )
        .catch(error => {
            console.log('-=-=--parseJSON error', error)
            error.status = response.status
            reject(error)
        })
})

const getPreFetched = ({ name = '', file = '' }) => async (dispatch) => {
    clearData(dispatch)
    dispatch({
        type: types.CLEAR_PRE_FETCH_ERROR,
    })
    dispatch({ type: types.FETCH_START })
    dispatch({
        type: types.FETCH_STATUS,
        payload: { savedReportName: name }
    })

    console.log('-=-=--name, file', name, file)

    try {
        const reportData = await fetch(`https://n07734.github.io/community-health/data/${file}.json`)
            .then(parseJSON)

        setPreFetchedData(reportData, dispatch)

    } catch (error) {
        console.log('-=-=--api data error', error, error.status)

        const message = error.status !== 200
            ? `Error status code ${error.status} loading ${file}`
            : `${error.message} loading ${file}`

        dispatch({
            type: types.PRE_FETCH_ERROR,
            payload: {
                level: 'error',
                message: message || 'Unknown error',
            },
        })
        dispatch({ type: types.FETCH_END })
    }
}

const getPreFetchedData = (name = 'nivo') => (dispatch) => {
    const reportData = require(`../prefetchedData/${name}.json`)
    setPreFetchedData(reportData, dispatch)
}

const getDownloadProps = (dispatch, getState) => {
    const state = getState()

    const repo = path(['fetches', 'repo'], state)
    const teamName = path(['fetches', 'teamName'], state)
    const fileName = teamName
        ? teamName
        : `${path(['fetches', 'org'], state)}-${repo}`

    const getReportData = pipe(
        pickAll(['fetches', 'pullRequests', 'filteredPRs', 'userData', 'issues', 'filteredIssues', 'releases', 'teamName']),
        dissocPath(['fetches', 'token']),
        dissocPath(['fetches', 'amountOfData']),
        // TODO: strip hasNextPage from user's pagination data
        dissocPath(['fetches', 'prPagination', 'hasNextPage']),
        dissocPath(['fetches', 'issuesPagination', 'hasNextPage']),
        dissocPath(['fetches', 'releasesPagination', 'hasNextPage']),
        assoc('preFetchedName', fileName),
        slimObject
    )

    const reportData = getReportData(state)
    const json = JSON.stringify(reportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const href  = URL.createObjectURL(blob)

    return {
        href,
        download: `${fileName}.json`,
    }
}

const checkUntilDate = (newSortDirection = '') => (dispatch, getState) => {
    const {
        sortDirection = '',
    } = getState();

    sortDirection !== newSortDirection
        && dispatch({ type: types.CLEAR_UNTIL_DATE })
        && dispatch({ type: types.CLEAR_FORM_UNTIL_DATE })
}

export {
    setUser,
    clearAllData,
    clearUser,
    clearPastSearch,
    storeOrg,
    storeToken,
    storeRepo,
    storeTeamName,
    storeEnterpriseAPI,
    storeUserIds,
    storeExcludeIds,
    storeAmountOfData,
    storeFormUntilDate,
    storeUntilDate,
    storeSortDirection,
    getAPIData,
    getPreFetchedData,
    getPreFetched,
    toggleTheme,
    getDownloadProps,
    checkUntilDate,
}
