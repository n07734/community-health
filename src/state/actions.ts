import assoc from 'ramda/es/assoc'
import dissocPath from 'ramda/es/dissocPath'
import filter from 'ramda/es/filter'
import is from 'ramda/es/is'
import map from 'ramda/es/map'
import pickAll from 'ramda/es/pickAll'
import pipe from 'ramda/es/pipe'
import split from 'ramda/es/split'
import trim from 'ramda/es/trim'
import pick from 'ramda/es/pick'
import values from 'ramda/es/values'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import {
    ReportType,
    AnyForNow,
    AllState,
    FetchInfoForUser,
    FetchInfo,
    FetchInfoForTeam,
    FetchInfoForRepo,
    FetchInfoForOrg,
    ErrorUI,
} from '../types/State'
import { ApiResult } from '../types/Queries'
import { AnyObject } from '../types/Components'

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
import { PullRequest } from '../types/FormattedData'

import {
    setStateFetchStart,
    setStateFetchFailed,
    resetStateToInitialState,
    setSateFromPreFetchedData,
    useDataStore,
    useFetchStore,
} from './fetch'

export const userIdsFromString = pipe(
    split(','),
    map(trim),
    filter(Boolean),
)

const throwIfNotValidArgs = (fetches: FetchInfo) => {
    const {
        org = '',
        repo = '',
        token = '',
        userIds = [],
    } = fetches

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

    if (!isValid) {
        throw new Error('Not a valid request')
    }
}

export const trimmer = (dateFrom = '', dateTo = '') => <T>(dateKey:string = 'mergedAt', items: T[][] = []) => {
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

export const getStartEndDates = (prs: PullRequest[] = []) => {
    const { mergedAt: prStartDate = '' } = prs.at(0) || { mergedAt: ''}
    const { mergedAt: prEndDate = '' } = prs.at(-1) || { mergedAt: '' }

    return [
        prStartDate,
        prEndDate,
    ]
}

const fetchGitHubData = async (fetches: FetchInfo) => {
    try {
        throwIfNotValidArgs(fetches);
        setStateFetchStart()
        const {
            // fetches,
            filteredPRs = [],
            pullRequests = [],
            filteredReviewedPRs = [],
            reviewedPullRequests = [],
            issues = [],
            filteredIssues = [],
            releases = [],
            filteredReleases = [],
        } = useDataStore.getState();

        const formUntilDate = getUntilDate(
            fetches,
            pullRequests,
        )

        const {
            usersInfo,
            reportType,
            sortDirection = 'DESC',
            userIds = [],
        } = fetches

        const untilDate = formUntilDate

        const reportTypeMap: Record<ReportType, () => Promise<ApiResult>> = {
            user: async () => getUserData({ fetchInfo: fetches as FetchInfoForUser, untilDate }),
            team: async () => getUsersData({ fetchInfo: fetches as FetchInfoForTeam, untilDate }),
            repo: async () => api({ fetchInfo: fetches as FetchInfoForRepo, queryInfo: batchedQuery(untilDate) }),
            org: async () => getOrgData({ fetchInfo: fetches as FetchInfoForOrg, untilDate }),
        }

        const {
            fetchInfo,
            results = [],
            reviewResults = [],
        } = await reportTypeMap[reportType]()

        const newPullRequests = formatPullRequests(fetches, results)
        const filteredNewPullRequests = filterByUsersInfo(fetches, newPullRequests)
        const allPullRequests = pullRequests.concat(filteredPRs).concat(filteredNewPullRequests)

        const newestOldPR = pullRequests.at(-1)?.mergedAt?.slice(0, 10)
        const oldestOldPR = pullRequests.at(0)?.mergedAt?.slice(0, 10)

        const lastPRDate = newPullRequests.at(-1)?.mergedAt?.slice(0, 10)
        const nowDate = new Date().toISOString().slice(0, 10)

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

        const newReviewedPullRequests = formatPullRequests(fetches, reviewResults)
        const filteredNewReviewedPRs = newReviewedPullRequests
            .filter(({ author = '', mergedAt = '' }) => mergedAt && author !== userIds[0])
        const allReviewedPullRequests = reviewedPullRequests.concat(filteredReviewedPRs).concat(filteredNewReviewedPRs)
        const [includedReviewedPRs = [], newFilteredReviewedPRs = []] = filterSortPullRequests(fetches, reportDates, allReviewedPullRequests)

        const dates = getStartEndDates(includedPRs)

        const newReleases = formatReleases(results)
        const allReleases = formatReleaseData([
            ...filteredReleases,
            ...releases,
            ...newReleases,
        ])
        const [includesReleases, newFilteredReleases] = filterSortReleases(reportDates, allReleases)

        const newIssues = formatIssues(results)
        const allIssues = issues.concat(filteredIssues).concat(newIssues)
        const [includedIssues, newFilteredIssues] = filterSortIssues(reportDates, allIssues)

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

        useDataStore.setState((state) => ({
            ...state,
            pullRequests: includedPRs,
            filteredPRs: newFilteredPRs,
            reviewedPullRequests: includedReviewedPRs,
            filteredReviewedPRs: newFilteredReviewedPRs,
            itemsDateRange: dates,
            usersData: formatUserData(includedPRs.concat(includedReviewedPRs), usersInfo),
            releases: includesReleases,
            filteredReleases: newFilteredReleases,
            issues: includedIssues,
            filteredIssues: newFilteredIssues,
        }))

        useFetchStore.setState((state) => ({
            ...state,
            fetching: false,
            fetchStatus: {},
            prPagination: pageInfo(fetchInfo.prPagination),
            usersReviewsPagination: pageInfo(fetchInfo.usersReviewsPagination),
            releasesPagination: pageInfo(fetchInfo.releasesPagination),
            issuesPagination: pageInfo(fetchInfo.issuesPagination),
        }))
    } catch (err) {
        const error = err as ErrorUI
        setStateFetchFailed({
            level: 'error',
            message: error?.message || 'Unknown error',
        })
    }

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

type GetPreFetched = {
    fileName: string,
    externalURL?: string
    localData?: AllState,
} | {
    fileName?: string,
    externalURL?: string
    localData: AllState,
}

const getPreFetched = async ({
    fileName = '',
    externalURL = '',
    localData,
}: GetPreFetched) => {
    resetStateToInitialState()
    setStateFetchStart({ fetchStatus:  { savedReportName: fileName } });

    try {
        if (localData) {
            return setSateFromPreFetchedData(localData)
        }
        const fetchLink = externalURL
            ? `${externalURL}${fileName}.json`
            : `https://n07734.github.io/community-health/data/${fileName}.json`

        const reportData = await fetch(fetchLink)
            .then(parseJSON) as AllState

        setSateFromPreFetchedData(reportData)
    } catch (err) {
        const error = err as { status: number, message: string }
        console.log('-=-=--api data error', error, error.status)

        const message = error.status !== 200
            ? `Error status code ${error.status} loading ${fileName}`
            : `${error.message} loading ${fileName}`

        setStateFetchFailed( {
            level: 'error',
            message: message || 'Unknown error',
        })
    }
}

const getDownloadProps = () => {
    const data = useDataStore.getState()
    const fetches = useFetchStore.getState()

    const state = {
        ...data,
        fetches,
    }

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
        pickAll(['fetches', 'pullRequests', 'filteredPRs', 'reviewedPullRequests', 'filteredReviewedPRs', 'userData', 'issues', 'filteredIssues', 'releases', 'teamName', 'chartConfig']),
        dissocPath(['fetches', 'token']),
        dissocPath(['fetches', 'sortDirection']),
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

export {
    fetchGitHubData,
    getPreFetched,
    getDownloadProps,
}
