import assoc from 'ramda/es/assoc'
import dissocPath from 'ramda/es/dissocPath'
import equals from 'ramda/es/equals'
import filter from 'ramda/es/filter'
import is from 'ramda/es/is'
import not from 'ramda/es/not'
import map from 'ramda/es/map'
import pickAll from 'ramda/es/pickAll'
import pipe from 'ramda/es/pipe'
import split from 'ramda/es/split'
import trim from 'ramda/es/trim'
import propOr from 'ramda/es/propOr'
import pick from 'ramda/es/pick'
import values from 'ramda/es/values'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import { AnyAction, Dispatch } from 'redux'
import { FetchInfo, ReportType, AllState, AnyForNow } from '../types/State'
import { AmountOfData } from '../types/Queries'
import { AnyObject, Users } from '../types/Components'

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
import { EventInfo, PullRequest } from '../types/FormattedData'

const storeToken = (token = '') => ({
    type: types.STORE_TOKEN,
    payload: token,
})

const storeOrg = (org = '') => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.STORE_ORG,
    payload: org,
})

const storeEnterpriseAPI = (enterpriseAPI = '') => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.STORE_ENT_URL,
    payload: enterpriseAPI,
})

const storeTeamName = (teamName = '') => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.SET_TEAM_NAME,
    payload: teamName,
})

const userIdsFromString = pipe(
    split(','),
    map(trim),
    filter(Boolean),
)

const storeUsersInfo = (usersInfo = {}) => (dispatch: Dispatch<AnyAction>) => {
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

const storeExcludeIds = (excludeIds = '') => (dispatch: Dispatch<AnyAction>) => {
    const excludeArray = userIdsFromString(excludeIds)
    return dispatch({
        type: types.STORE_EX_IDS,
        payload: excludeArray,
    })
}

const storeEvents = (eventsString = '') => (dispatch: Dispatch<AnyAction>) => {
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

const storeRepo = (repo = '') => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.STORE_REPO,
    payload: repo,
})

const storeAmountOfData = (amountOfData:AmountOfData) => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.STORE_AMOUNT,
    payload: amountOfData || '',
})

const storeFormUntilDate = (amountOfData:AmountOfData) => (dispatch: Dispatch<AnyAction>, getState: () => AllState) => {
    const {
        fetches,
        pullRequests = [],
    } = getState();

    const formUntilDate = getUntilDate(
        {
            ...fetches,
            amountOfData: amountOfData || '',
        },
        pullRequests,
    )

    dispatch({
        type: types.STORE_FORM_UNTIL_DATE,
        payload: formUntilDate,
    })
}

const storeUntilDate = (untilDate = '') => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.STORE_UNTIL_DATE,
    payload: untilDate,
})

const storeSortDirection = (sortDirection = 'DESC') => (dispatch: Dispatch<AnyAction>) => dispatch({
    type: types.STORE_SORT,
    payload: sortDirection,
})

type Values = {
    [key: string]: string | string[] | number | Users
}
const notSameStringValues = (formValues:Values = {}, fetches:Values = {}) => (key:string = '') =>
    formValues[key] && fetches[key] && formValues[key] !== fetches[key]
const notSameArrayValues = (formValues = {}, fetches:Values = {}) => (key = '') => {
    const idsString = propOr('', key, formValues) as string
    const formIds = userIdsFromString(idsString)

    const currentIds = fetches[key] as string[]
    return currentIds.length && not(equals(currentIds, formIds))
}

const notSameUsersInfo = (formValues:Values = {}, fetches:Values = {}) => {
    const formUserId = formValues.userId
    const [currentUserId] = fetches.userIds as string[]

    const usersInfo = formValues?.usersInfo || {}
    const currentUsersInfo = fetches.usersInfo || {}

    const hasDifferentUserList = formUserId && currentUserId && formUserId !== currentUserId
    const hasDifferentUsersInfo = not(equals(usersInfo, currentUsersInfo))

    return hasDifferentUserList || hasDifferentUsersInfo
}

// TODO: regression test
const clearPastSearch = (values:Values) => (dispatch: Dispatch<AnyAction>, getState: () => AllState) => {
    const {
        fetches = {},
    } = getState()

    const notSameValues = notSameStringValues(values,fetches)
    const notSameIds = notSameArrayValues(values, fetches)

    const isNewSearch =
        notSameValues('org')
        || notSameValues('repo')
        || notSameValues('teamName')
        || notSameValues('enterpriseAPI')
        || notSameUsersInfo(values,fetches)
        || notSameIds('excludeIds')

    isNewSearch
        && clearData(dispatch)
}

const clearData = (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: types.CLEAR_ORG })
    dispatch({ type: types.CLEAR_REPO })
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

type Fetches = { fetches: FetchInfo}
const getErrorMessage = (state: Fetches) => {
    const {
        fetches: {
            org = '',
            repo = '',
            token = '',
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

    const prepend = (i: number) => {
        const maxIndex = missing.length - 1

        const prepStrings: string[] = [
            i === 0
                ? 'Missing '
                : '',
            i === maxIndex
                ? ' and '
                : '',
            i > 0
                ? ', '
                : '',
        ]

        return prepStrings.find((x) => x.length > 0) || ''
    }

    const message = missing
        .reduce((acc, current, i) => acc + prepend(i) + current, '')

    return message
}

const validateRequest = (state: Fetches) => {
    const {
        fetches: {
            org = '',
            repo = '',
            token = '',
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

const trimmer = (dateFrom = '', dateTo = '') => <T>(dateKey:string = 'mergedAt', items: T[][] = []) => {
    const newTrimmedLeft: T[] = []
    const keptItems: T[] = []
    const newTrimmedRight: T[] = []

    const trimmer = (items:T[] = []) => items
        .forEach((item) => {
            const itemsDate = new Date(( item as Record<string, string>)[dateKey])
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

const trimItems = (dateFrom = '', dateTo = '') => async (dispatch: Dispatch<AnyAction>, getState: () => AllState) => {
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
    ] = itemsTrimmer<PullRequest>('mergedAt', allPrs)

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
    ] = itemsTrimmer<PullRequest>('mergedAt', allReviewedPrs)

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
    ] = itemsTrimmer<EventInfo>('date', allReleases)

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

const getStartEndDates = (prs: PullRequest[] = []) => {
    const { mergedAt: prStartDate = '' } = prs.at(0) || { mergedAt: ''}
    const { mergedAt: prEndDate = '' } = prs.at(-1) || { mergedAt: '' }

    return [
        prStartDate,
        prEndDate,
    ]
}


const getAPIData = () => async (dispatch: Dispatch<AnyAction>, getState: () => AllState) => {
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
            fetches,
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
            usersInfo,
        } = fetches

        const userIds = fetches?.userIds || []
        const repo = fetches?.repo || ''
        const org = fetches?.org || ''

        const untilDate = formUntilDate

        const reportType:ReportType = (userIds.length === 1 && 'user')
            || (userIds.length > 1 && 'team')
            || (!repo && org && 'org')
            || 'repo'

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
        const allPullRequests = pullRequests.concat(filteredPRs).concat(filteredNewPullRequests)

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

        const pageInfo = (info:AnyForNow = {}) => {
            const picks = pick(['newest', 'oldest'])

            const nextLevel:AnyObject = {}
            Object.entries(info)
                .filter(([, value]) => is(Object, value) && values(picks(value)).length > 0)
                .forEach(([key, value]:[string, AnyForNow]) => {
                    nextLevel[key] = picks(value)
                })

            const infoPicks = picks(info)
            return {
                ...infoPicks,
                ...nextLevel,
            }
        }

        dispatch({
            type: types.SET_PR_PAGINATION,
            payload: pageInfo(fetchInfo.prPagination),
        })

        dispatch({
            type: types.SET_PR_REVIEWED_PAGINATION,
            payload: pageInfo((fetchInfo as FetchInfo).usersReviewsPagination),
        })

        dispatch({
            type: types.SET_ISSUES_PAGINATION,
            payload: pageInfo(fetchInfo.issuesPagination),
        })

        dispatch({
            type: types.SET_RELEASES_PAGINATION,
            payload: pageInfo((fetchInfo as FetchInfo).releasesPagination),
        })

        dispatch({ type: types.FETCH_END })

    } catch (err) {
        const error = err as Error
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

const setPreFetchedData = (repoData: AllState, dispatch: Dispatch<AnyAction>) => {
    const {
        fetches,
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

    type FetchesInfo = [
        keyof FetchInfo,
        string,
        object | string,
    ]
    const fetchesInfo:FetchesInfo[] = [
        ['token', 'STORE_TOKEN', ''],
        ['org', 'STORE_ORG', ''],
        ['repo', 'STORE_REPO', ''],
        ['enterpriseAPI', 'STORE_ENT_URL', ''],
        ['prPagination', 'SET_PR_PAGINATION', {}],
        ['usersReviewsPagination', 'SET_PR_REVIEWED_PAGINATION', {}],
        ['releasesPagination', 'SET_RELEASES_PAGINATION', {}],
        ['issuesPagination', 'SET_ISSUES_PAGINATION', {}],
    ];

    fetchesInfo.forEach(([fetchesKey, type = '', fallback]:FetchesInfo) => {
        dispatch({
            type: types[type as string],
            payload: fetches?.[fetchesKey] || fallback,
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

    const dates = getStartEndDates(pullRequests)
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

const parseJSON = (response: { status: number, json(): Promise<object> }) => new Promise((resolve, reject) => {
    response.json()
        .then((data: object) => response.status === 200
            ? resolve(data)
            : reject(new Error(`Error status code ${response.status}`)),
        )
        .catch((err) => {
            const error:{ status: number } = err
            console.log('-=-=--parseJSON error', error)
            error.status = response.status
            reject(error)
        })
})

const getPreFetched = ({
    fileName = '',
    externalURL = '',
    localData,
}: AnyForNow = {}) => async (dispatch: Dispatch<AnyAction>) => {
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

    } catch (err) {
        const error = err as { status: number, message: string }
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

const getDownloadProps = (_dispatch: () => void, getState: () => AllState) => {
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

const checkUntilDate = (newSortDirection = '') => (dispatch: Dispatch<AnyAction>, getState: () => AllState) => {
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
    clearAllData,
    clearPastSearch,
    storeOrg,
    storeToken,
    storeRepo,
    storeTeamName,
    storeEnterpriseAPI,
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
