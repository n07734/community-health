import {
    anyPass,
    assoc,
    difference,
    dissocPath,
    equals,
    filter,
    is,
    not,
    map,
    pickAll,
    pipe,
    split,
    trim,
    propOr,
    pick,
    toPairs,
    values,
} from 'ramda'
import { isAfter, isBefore } from 'date-fns'

import api from '../api/api'
import getUsersData from '../api/getUsersData'
import getUserData from '../api/getUserData'
import getOrgData from '../api/getOrgData'
import getUntilDate from '../api/getUntilDate'
import {
    formatPullRequests,
    filterSortPullRequests,
    filterByUsersInfo,
    formatIssues,
    filterSortIssues,
    formatReleases,
    filterSortReleases,
} from '../format/rawData'
import { slimObject } from '../format/lightenData'
import { batchedQuery } from '../api/queries'
import formatUserData from '../format/userData'
import { formatReleaseData } from '../format/releaseData'
import types from './types'

const setUser = (user = '') => (dispatch) => {
    dispatch({
        type: types.SET_USER,
        payload: user,
    })
}

const setPvP = () => (dispatch) => {
    dispatch({ type: types.SET_PVP })
}

const clearPvP = () => ({
    type: types.CLEAR_PVP,
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
    filter(Boolean),
)

// TODO: not in right place. needs to be in form validation
const getUsersInfo = (usersString = '') => {
    const usersArray = userIdsFromString(usersString)

    const userIds = []
    const usersInfo = {}

    usersArray
        .forEach((user = '') => {
            // eg with dates userName=start:2020-12-12;end:2020|start:2020-12-12
            const [userId = '', usersInfoString = ''] = user.split('=')
            userIds.push(userId)

            const dates = []
            usersInfoString
                .split('|')
                .forEach((detailsChunk = '') => {
                    const [, startDate = ''] = detailsChunk.match(/start:([\d-/]*)/i) || []
                    const [, endDate = ''] = detailsChunk.match(/end:([\d-/]*)/i) || []

                    if (startDate || endDate) {
                        dates.push({
                            ...(startDate && { startDate }),
                            ...(endDate && { endDate }),
                        })
                    }
                })

            const [, name = ''] = usersInfoString.match(/name:([^|,]+)/i) || []
            if (dates.length > 0 || name) {
                usersInfo[userId] = {
                    userId,
                    name,
                    dates,
                }
            }
        })

    return {
        userIds,
        usersInfo,
    }
}

const storeUserIds = (usersString = '') => (dispatch) => {
    const {
        userIds = [],
    } = getUsersInfo(usersString)

    return dispatch({
        type: types.STORE_USER_IDS,
        payload: userIds,
    })
}

const storeUsersInfo = (usersInfo = {}) => (dispatch) => {
    const userIds = Object.keys(usersInfo)

    dispatch({
        type: types.STORE_USERS_INFO,
        payload: usersInfo,
    })

    return dispatch({
        type: types.STORE_USER_IDS,
        payload: userIds,
    })
}

const storeExcludeIds = (excludeIds = '') => (dispatch) => {
    const excludeArray = userIdsFromString(excludeIds)
    return dispatch({
        type: types.STORE_EX_IDS,
        payload: excludeArray,
    })
}

const storeEvents = (eventsString = '') => (dispatch) => {
    const items = userIdsFromString(eventsString)
    const events = items
        .map((item = '') => {
            const [name, date] = item.split('=')
            return {
                name,
                date,
            }
        })

    return dispatch({
        type: types.STORE_EVENTS,
        payload: events,
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
        fetches = {},
        pullRequests = [],
    } = getState();

    const formUntilDate = getUntilDate(
        {
            ...fetches,
            amountOfData,
        },
        pullRequests,
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

const notSameUsersInfo = (formValues = {}) => (fetches = {}) => {
    const usersString = propOr('', 'userIds', formValues)
    const {
        userIds = [],
    } = getUsersInfo(usersString)

    const formUserId = formValues.userId
    const formUserIds = formUserId ? [formUserId] : userIds

    const usersInfo = formValues?.usersInfo || {}
    const currentIds = fetches.userIds
    const currentUsersInfo = fetches.usersInfo || {}

    const hasDifferentUserList = difference(currentIds, formUserIds).length > 0
    const hasDifferentUsersInfo = not(equals(usersInfo, currentUsersInfo))

    return hasDifferentUserList || hasDifferentUsersInfo
}

// TODO: regression test
const clearPastSearch = (values) => (dispatch, getState) => {
    const {
        fetches = {},
    } = getState()

    const notSameValues = notSameStringValues(values)
    const notSameIds = notSameArrayValues(values)

    const isNewSearch = anyPass([
        notSameValues('org'),
        notSameValues('repo'),
        notSameValues('teamName'),
        notSameValues('enterpriseAPI'),
        notSameUsersInfo(values),
        notSameIds('excludeIds'),
    ])(fetches)

    isNewSearch
        && clearData(dispatch)
}

const clearData = (dispatch) => {
    dispatch({ type: types.CLEAR_ORG })
    dispatch({ type: types.CLEAR_REPO })
    dispatch({ type: types.CLEAR_USER })
    dispatch({ type: types.CLEAR_PVP })
    dispatch({ type: types.CLEAR_TRIMMED_ITEMS })
    dispatch({ type: types.CLEAR_PRS })
    dispatch({ type: types.CLEAR_FILTERED_PRS })
    dispatch({ type: types.CLEAR_REVIEWED_PRS })
    dispatch({ type: types.CLEAR_REVIEWED_FILTERED_PRS })
    dispatch({ type: types.CLEAR_ITEMS_DATE_RANGE })
    dispatch({ type: types.CLEAR_PR_PAGINATION })
    dispatch({ type: types.CLEAR_PREFETCHED_NAME })
    dispatch({ type: types.CLEAR_DESC })
    dispatch({ type: types.CLEAR_UNTIL_DATE })
    dispatch({ type: types.CLEAR_FORM_UNTIL_DATE })
    dispatch({ type: types.CLEAR_USER_IDS })
    dispatch({ type: types.CLEAR_USERS_INFO })
    dispatch({ type: types.CLEAR_EX_IDS })
    dispatch({ type: types.CLEAR_EVENTS })
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
        !token && 'GitHib token',
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

    const stringArgs = [token]
    org && stringArgs.push(org)
    repo && stringArgs.push(repo)

    const validStringArgs = stringArgs
        .every(item => typeof item === 'string' && item.length > 0)

    const arrayArgs = userIds.length
        ? [userIds]
        : []

    const validArrayArgs = arrayArgs
        .every(item => item.length > 0)

    const isValid = validStringArgs && validArrayArgs

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

const trimmer = (dateFrom = '', dateTo = '') => (dateKey = 'mergedAt', items = []) => {
    const newTrimmedLeft = []
    const keptItems = []
    const newTrimmedRight = []

    const trimmer = (items = []) => items
        .forEach((item = {}) => {
            const itemsDate = new Date(item[dateKey])
            if (isBefore(itemsDate, new Date(dateFrom))) {
                newTrimmedLeft.push(item)
            } else if (isAfter(itemsDate, new Date(dateTo))) {
                newTrimmedRight.push(item)
            } else {
                keptItems.push(item)
            }
        })

    // There can be a lot of prs so don't think ...[] would be a good idea for this
    items
        .forEach(trimmer)

    return [
        newTrimmedLeft,
        keptItems,
        newTrimmedRight,
    ]
}

const trimItems = (dateFrom = '', dateTo = '') => async (dispatch, getState) => {
    const {
        fetches: {
            usersInfo = {},
        } = {},
        trimmedItems: {
            trimmedPRs: {
                trimmedLeftPrs = [],
                trimmedRightPrs = [],
            } = {},
            trimmedReviewedPRs: {
                trimmedLeftReviewedPrs = [],
                trimmedRightReviewedPrs = [],
            } = {},
            trimmedReleases: {
                trimmedLeftReleases = [],
                trimmedRightReleases = [],
            } = {},
        } = {},
        pullRequests = [],
        reviewedPullRequests = [],
        releases = [],
    } = getState();

    const itemsTrimmer = trimmer(dateFrom, dateTo)

    const allPrs = [
        trimmedLeftPrs,
        pullRequests,
        trimmedRightPrs,
    ]
    const [
        newTrimmedLeftPrs,
        keptPrs,
        newTrimmedRightPrs,
    ] = itemsTrimmer('mergedAt', allPrs)

    dispatch({
        type: types.ADD_PRS,
        payload: keptPrs,
    })

    const allReviewedPrs = [
        trimmedLeftReviewedPrs,
        reviewedPullRequests,
        trimmedRightReviewedPrs,
    ]
    const [
        newTrimmedLeftReviewedPrs,
        keptReviewedPrs,
        newTrimmedRightReviewedPrs,
    ] = itemsTrimmer('mergedAt', allReviewedPrs)

    dispatch({
        type: types.ADD_REVIEWED_PRS,
        payload: keptReviewedPrs,
    })

    dispatch({
        type: types.ADD_USERS_DATA,
        payload: formatUserData(keptPrs.concat(keptReviewedPrs), usersInfo),
    })

    const allReleases = [
        trimmedLeftReleases,
        releases,
        trimmedRightReleases,
    ]
    const [
        newTrimmedLeftReleases,
        keptReleases,
        newTrimmedRightReleases,
    ] = itemsTrimmer('date', allReleases)

    dispatch({
        type: types.ADD_RELEASES,
        payload: keptReleases,
    })

    dispatch({
        type: types.ADD_TRIMMED_ITEMS,
        payload: {
            trimmedPRs: {
                trimmedLeftPrs: newTrimmedLeftPrs,
                trimmedRightPrs: newTrimmedRightPrs,
            },
            trimmedReviewedPRs: {
                trimmedLeftReviewedPrs: newTrimmedLeftReviewedPrs,
                trimmedRightReviewedPrs: newTrimmedRightReviewedPrs,
            },
            trimmedReleases: {
                trimmedLeftReleases: newTrimmedLeftReleases,
                trimmedRightReleases: newTrimmedRightReleases,
            },
        },
    })
}

const getStartEndDates = (prs = []) => {
    const { mergedAt: prStartDate = '' } = prs.at(0) || {}
    const { mergedAt: prEndDate = '' } = prs.at(-1) || {}

    return [
        prStartDate,
        prEndDate,
    ]
}

const getAPIData = () => async (dispatch, getState) => {
    const state = getState();

    const { isValid: isValidRequest } = validateRequest(state);

    isValidRequest && dispatch({
        type: types.CLEAR_FETCH_ERROR,
    })

    isValidRequest && dispatch({
        type: types.FETCH_START,
    })

    try {
        if (!isValidRequest) {
            throw new Error('Not a valid request')
        }

        const {
            fetches = {},
            filteredPRs = [],
            pullRequests = [],
            filteredReviewedPRs = [],
            reviewedPullRequests = [],
            issues = [],
            filteredIssues = [],
            formUntilDate = '',
            releases = [],
            filteredReleases = [],
        } = getState();

        const {
            usersInfo = {},
        } = fetches

        const userIds = propOr([], 'userIds', fetches)
        const repo = propOr([], 'repo', fetches)
        const org = propOr([], 'org', fetches)

        const untilDate = formUntilDate

        const reportType = (userIds.length === 1 && 'user')
            || (userIds.length > 1 && 'team')
            || (repo && org && 'repo')
            || org && 'org'

        const reportTypeMap = {
            user: () => getUserData({ fetchInfo: fetches, untilDate, dispatch }),
            team: () => getUsersData({ fetchInfo: fetches, untilDate, dispatch }),
            repo: () => api({ fetchInfo: fetches, queryInfo: batchedQuery(untilDate), dispatch }),
            org: () => getOrgData({ fetchInfo: fetches, untilDate, dispatch }),
        }

        const {
            fetchInfo = {},
            results = [],
            reviewResults = [],
        } = await reportTypeMap[reportType]();

        const newPullRequests = formatPullRequests(fetches, results)
        const filteredNewPullRequests = filterByUsersInfo(fetches, newPullRequests)
        const allPullRequests = reviewedPullRequests.concat(filteredPRs).concat(filteredNewPullRequests)

        const newestOldPR = pullRequests.at(-1)?.mergedAt?.slice(0, 10)
        const oldestOldPR = pullRequests.at(0)?.mergedAt?.slice(0, 10)

        const lastPRDate = newPullRequests.at(-1)?.mergedAt?.slice(0, 10)
        const nowDate = new Date().toISOString().slice(0, 10)

        const {
            sortDirection = 'DESC',
        } = fetches

        const reportDates = sortDirection === 'DESC'
            ? {
                reportStartDate: untilDate || lastPRDate,
                reportEndDate: newestOldPR || nowDate,
            } : {
                reportStartDate: oldestOldPR,
                reportEndDate: untilDate || nowDate,
            }

        // Get all prs together so then can be cleanly filtered and sorted
        const [includedPRs, newFilteredPRs] = filterSortPullRequests(fetches, reportDates, allPullRequests)
        dispatch({
            type: types.ADD_PRS,
            payload: includedPRs,
        })
        dispatch({
            type: types.ADD_FILTERED_PRS,
            payload: newFilteredPRs,
        })

        const newReviewedPullRequests = formatPullRequests(fetches, reviewResults)
        const filteredNewReviewedPRs = newReviewedPullRequests
            .filter(({ author = '', mergedAt = '' }) => mergedAt && author !== userIds[0])
        const allReviewedPullRequests = reviewedPullRequests.concat(filteredReviewedPRs).concat(filteredNewReviewedPRs)
        const [includedReviewedPRs = [], newFilteredReviewedPRs = []] = filterSortPullRequests(fetches, reportDates, allReviewedPullRequests)
        dispatch({
            type: types.ADD_REVIEWED_PRS,
            payload: includedReviewedPRs,
        })
        dispatch({
            type: types.ADD_REVIEWED_FILTERED_PRS,
            payload: newFilteredReviewedPRs,
        })

        const dates = getStartEndDates(includedPRs)
        dispatch({
            type: types.ADD_ITEMS_DATE_RANGE,
            payload: dates,
        })

        dispatch({
            type: types.ADD_USERS_DATA,
            payload: formatUserData(includedPRs.concat(includedReviewedPRs), usersInfo),
        })

        if (reportType === 'repo') {
            const newReleases = formatReleases(results)
            const allReleases = formatReleaseData([
                ...filteredReleases,
                ...releases,
                ...newReleases,
            ])
            const [includesReleases, newFilteredReleases] = filterSortReleases(reportDates, allReleases)
            dispatch({
                type: types.ADD_RELEASES,
                payload: includesReleases,
            })
            dispatch({
                type: types.ADD_FILTERED_RELEASES,
                payload: newFilteredReleases,
            })
        }

        const newIssues = formatIssues(results)
        const allIssues = issues.concat(filteredIssues).concat(newIssues)
        const [includedIssues, newFilteredIssues] = filterSortIssues(reportDates, allIssues)
        dispatch({
            type: types.ADD_ISSUES,
            payload: includedIssues,
        })
        dispatch({
            type: types.ADD_FILTERED_ISSUES,
            payload: newFilteredIssues,
        })

        dispatch({
            type: types.STORE_UNTIL_DATE,
            payload: formUntilDate,
        })

        const pageInfo = (info = {}) => {
            const picks = pick(['newest', 'oldest'])

            const nextLevel = {}
            toPairs(info)
                .filter(([, value]) => is(Object, value) && values(picks(value)).length > 0)
                .forEach(([key, value]) => {
                    nextLevel[key] = picks(value)
                })

            return {
                ...picks(info),
                ...nextLevel,
            }
        }

        dispatch({
            type: types.SET_PR_PAGINATION,
            payload: pageInfo(fetchInfo.prPagination),
        })

        dispatch({
            type: types.SET_PR_REVIEWED_PAGINATION,
            payload: pageInfo(fetchInfo.usersReviewsPagination),
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
        reportDescription = '',
        pullRequests = [],
        filteredPRs = [],
        reviewedPullRequests = [],
        filteredReviewedPRs = [],
        usersData = [],
        issues = [],
        filteredIssues = [],
        releases = [],
        filteredReleases = [],
    } = repoData

    const {
        teamName = '',
        userIds = [],
        usersInfo = {},
        excludeIds = [],
        events = [],
        repo = '',
        org = '',
    } = fetches

    clearData(dispatch)

    const fetchesInfo = [
        ['token', 'STORE_TOKEN'],
        ['org', 'STORE_ORG'],
        ['repo', 'STORE_REPO'],
        ['enterpriseAPI', 'STORE_ENT_URL'],
        ['prPagination', 'SET_PR_PAGINATION', {}],
        ['usersReviewsPagination', 'SET_PR_REVIEWED_PAGINATION', {}],
        ['releasesPagination', 'SET_RELEASES_PAGINATION', {}],
        ['issuesPagination', 'SET_ISSUES_PAGINATION', {}],
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
        type: types.STORE_SORT,
        payload: 'ASC',
    })

    dispatch({
        type: types.STORE_AMOUNT,
        payload: 'all',
    })

    dispatch({
        type: types.SET_DESC,
        payload: reportDescription,
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
        type: types.STORE_USERS_INFO,
        payload: usersInfo,
    })

    dispatch({
        type: types.STORE_EX_IDS,
        payload: excludeIds,
    })

    dispatch({
        type: types.STORE_EVENTS,
        payload: events,
    })

    const dates = getStartEndDates(pullRequests, issues)
    dispatch({
        type: types.ADD_ITEMS_DATE_RANGE,
        payload: dates,
    })

    dispatch({
        type: types.ADD_PRS,
        payload: pullRequests,
    })
    dispatch({
        type: types.ADD_FILTERED_PRS,
        payload: filteredPRs,
    })

    dispatch({
        type: types.ADD_REVIEWED_PRS,
        payload: reviewedPullRequests,
    })
    dispatch({
        type: types.ADD_REVIEWED_FILTERED_PRS,
        payload: filteredReviewedPRs,
    })

    dispatch({
        type: types.ADD_USERS_DATA,
        payload: usersData.length
            ? usersData
            : formatUserData(pullRequests.concat(reviewedPullRequests), usersInfo),
    })
    // old saved reports did not sort the issues
    const sortedIssues = issues
        .sort((
            { mergedAt: dateA = '' },
            { mergedAt: dateB = '' },
        ) => new Date(dateA).getTime() - new Date(dateB).getTime())
    dispatch({
        type: types.ADD_ISSUES,
        payload: sortedIssues,
    })

    dispatch({
        type: types.ADD_FILTERED_ISSUES,
        payload: filteredIssues,
    })

    if (repo && org) {
        const allReleases = formatReleaseData(releases)
        dispatch({
            type: types.ADD_RELEASES,
            payload: allReleases,
        })

        dispatch({
            type: types.ADD_FILTERED_RELEASES,
            payload: filteredReleases,
        })
    }

    dispatch({
        type: types.FETCH_END,
    })
}

const parseJSON = response => new Promise((resolve, reject) => {
    response.json()
        .then(data => response.status === 200
            ? resolve(data)
            : reject(new Error(`Error status code ${response.status}`)),
        )
        .catch(error => {
            console.log('-=-=--parseJSON error', error)
            error.status = response.status
            reject(error)
        })
})

const getPreFetched = ({
    fileName = '',
    externalURL = '',
    localData,
} = {}) => async (dispatch) => {
    clearData(dispatch)
    dispatch({
        type: types.CLEAR_PRE_FETCH_ERROR,
    })
    dispatch({ type: types.FETCH_START })
    dispatch({
        type: types.FETCH_STATUS,
        payload: { savedReportName: fileName },
    })

    const fetchLink = externalURL
        ? `${externalURL}${fileName}.json`
        : `https://n07734.github.io/community-health/data/${fileName}.json`

    try {
        const reportData = localData
            ? localData
            : await fetch(fetchLink)
                .then(parseJSON)

        setPreFetchedData(reportData, dispatch)

    } catch (error) {
        console.log('-=-=--api data error', error, error.status)

        const message = error.status !== 200
            ? `Error status code ${error.status} loading ${fileName}`
            : `${error.message} loading ${fileName}`

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

const getDownloadProps = (dispatch, getState) => {
    const state = getState()

    const {
        repo,
        org,
        teamName,
        userIds = [],
    } = state?.fetches || {}

    const user = userIds?.length === 1
        ? userIds[0]
        : ''
    const name = teamName
        || user
        || `${org}${repo ? `-${repo}` : ''}`

    const getReportData = pipe(
        assoc('HOW_TO', '1: Add this file to ./src/myReports 2: Run the app. If you want multiple reports you will need to edit ./src/myReports/myReportsConfig.js.'),
        pickAll(['fetches', 'pullRequests', 'filteredPRs', 'reviewedPullRequests', 'filteredReviewedPRs', 'userData', 'issues', 'filteredIssues', 'releases', 'teamName']),
        dissocPath(['fetches', 'token']),
        dissocPath(['sortDirection']),
        dissocPath(['fetches', 'amountOfData']),
        // TODO: strip hasNextPage from user's pagination data
        dissocPath(['fetches', 'prPagination', 'hasNextPage']),
        dissocPath(['fetches', 'issuesPagination', 'hasNextPage']),
        dissocPath(['fetches', 'releasesPagination', 'hasNextPage']),
        assoc('preFetchedName', name),
        slimObject,
    )

    const reportData = getReportData(state)
    const json = JSON.stringify(reportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const href = URL.createObjectURL(blob)

    return {
        href,
        download: `${name}.json`,
    }
}

const checkUntilDate = (newSortDirection = '') => (dispatch, getState) => {
    const {
        fetches: {
            sortDirection = '',
        } = {},
    } = getState();

    sortDirection !== newSortDirection
        && dispatch({ type: types.CLEAR_UNTIL_DATE })
        && dispatch({ type: types.CLEAR_FORM_UNTIL_DATE })
}

export {
    getUsersInfo,
    setUser,
    clearAllData,
    clearUser,
    setPvP,
    clearPvP,
    clearPastSearch,
    storeOrg,
    storeToken,
    storeRepo,
    storeTeamName,
    storeEnterpriseAPI,
    storeUserIds,
    storeUsersInfo,
    storeExcludeIds,
    storeEvents,
    storeAmountOfData,
    storeFormUntilDate,
    storeUntilDate,
    storeSortDirection,
    getAPIData,
    getPreFetched,
    getDownloadProps,
    checkUntilDate,
    trimItems,
}
