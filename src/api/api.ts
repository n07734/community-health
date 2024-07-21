// TODO: Think more about if this should maintain github api data structures
// TODO: add tests
import {
    always,
    cond,
    propOr,
    pathOr,
    mergeDeepRight,
    test,
    T as alwaysTrue,
    F as alwaysFalse,
} from 'ramda'
import { compose } from 'redux'
import { AmountOfData, ApiInfo, ApiResponse, ApiResult, ApiResults, ApiFetchInfo } from '../types/Querys'
import { ObjStrings } from '../types/Components'

import types from '../state/types'

import fillData from './fillers'
import { dateSort } from '../utils'
import { RawDataItem, RawDataResult, RawDataType, RawDate } from '../types/RawData'
import { FetchInfo } from '../types/State'

const parseJSON = (response: Response): Promise<ApiResponse> => new Promise((resolve, reject) => {
    response.json()
        .then(data => response.status === 200
            ? resolve(data)
            : reject(Object.assign(data, { status: response.status })),
        )
        .catch(error => {
            console.log('-=-=--parseJSON error', error)
            error.status = response.status
            reject(error)
        })
})

const triggeredAbuseRate = ({ message = '' }) =>/(You have triggered an abuse detection mechanism|You have exceeded a secondary rate limit)/.test(message)
const triggeredJsonError = ({ message = '' }) =>/Unexpected end of JSON input/.test(message)

const apiCall = (fetchInfo: ApiFetchInfo) => (query: string): Promise<ApiResponse> => {
    return fetch((fetchInfo.enterpriseAPI || 'https://api.github.com/graphql'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fetchInfo.token}`,
        },
        body: JSON.stringify({ query }),
    })
        .then(parseJSON);
}


const shouldGetNextPage = (hasNextPage: boolean, { amountOfData }: { amountOfData: AmountOfData }): boolean => cond([
    [always(hasNextPage === false), alwaysFalse],
    [always(hasNextPage && Number.isInteger(amountOfData) && amountOfData as number >= 1), alwaysTrue],
    [always(hasNextPage && amountOfData === 'all'), alwaysTrue],
    [alwaysTrue, alwaysFalse],
])();

const pause = (ms = 30000) => new Promise<void>(resolve => setTimeout(() => resolve(), ms))
let numRateTriggers = 0

const pauseThenRetry = async(apiInfo: ApiInfo, results: ApiResults): Promise<ApiResult> => {
    console.log('-=-=--paused', Date.now());
    await pause();
    console.log('-=-=--resume', Date.now());
    ++numRateTriggers
    return numRateTriggers <= 10
        ? api(apiInfo, results)
        : {
            errorMessage: {
                level: 'error',
                message: 'Hit rate limit over ten times',
            },
            fetchInfo: apiInfo.fetchInfo,
            results: results,
            reviewResults: [],
        }
}

const getCurrentCount = (type: RawDataType, results: RawDataResult[]):number => {
    const total = results
        .reduce((acc:number, result) => {
            const items = result?.data?.result?.[type]?.edges || []
            return acc + items.length
        }, 0)

    return total
}

const getLatestDate = (data:FetchInfo) => (type:RawDataType, results: RawDataResult[] = []):string => {
    const paginationKeyMap:ObjStrings = {
        pullRequests: 'prPagination',
        issues: 'issuesPagination',
        releases: 'releasesPagination',
    }
    const hasNextPage = pathOr(false, [paginationKeyMap[type], 'hasNextPageForDate'], data)

    const latestResult = results[results.length - 1] as RawDataResult || {}

    const latestItems = latestResult?.data?.result?.[type]?.edges || []

    const latestItem = latestItems[latestItems.length - 1]

    const dataKey:RawDate = type === 'pullRequests'
        ? 'createdAt'
        : 'closedAt'

    return hasNextPage
        ? (latestItem as RawDataItem)?.node?.[dataKey] || '' // TODO: figure out how to conditionally chose TS type
        : ''
}


const api = async({ fetchInfo, queryInfo, dispatch = () => {} }:ApiInfo, results: ApiResults = []): Promise<ApiResult>  => {
    const {
        query,
        resultInfo,
        fillerType,
        user,
        sortDirection,
    } = queryInfo(fetchInfo)

    const getLatestDateFor = getLatestDate(fetchInfo)

    const [furthestItemWithNextPage] = [
        getLatestDateFor('pullRequests', results),
        getLatestDateFor('issues', results),
        getLatestDateFor('releases', results),
    ]
        .filter(Boolean)
        .sort((a,b) => dateSort(sortDirection)(a as string,b as string))

    dispatch({
        type: types.FETCH_STATUS,
        payload: {
            prCount: getCurrentCount('pullRequests', results),
            issueCount: getCurrentCount('issues', results),
            releasesCount: getCurrentCount('releases', results),
            latestItemDate: furthestItemWithNextPage,
            user,
        },
    })

    const apiCallWithToken = apiCall(fetchInfo)
    try {
        const result = await apiCallWithToken(query)
        if (triggeredAbuseRate(result)) {
            throw new Error('Abuse rate triggered');
        }

        const fullData = await fillData(apiCallWithToken)(fillerType)(result)
        const updatedResults = [
            ...results,
            fullData,
        ]

        const {
            hasNextPage,
            nextPageInfo = {},
        } = resultInfo(result)

        const updatedFetchInfo: ApiFetchInfo = mergeDeepRight(fetchInfo, nextPageInfo)

        return shouldGetNextPage(hasNextPage, updatedFetchInfo)
            ? api({ fetchInfo: updatedFetchInfo, queryInfo, dispatch }, updatedResults)
            : {
                fetchInfo: updatedFetchInfo,
                results: updatedResults,
                reviewResults: [],
            }
    } catch (err) {
        type ApiError = {
            status: number,
            message: string,
            code: string,
        }
        const error = err as ApiError

        const hasTriggeredAbuse: (error: ApiError) => boolean = cond([
            [triggeredAbuseRate, alwaysTrue],
            [triggeredJsonError, alwaysTrue],
            [(error:ApiError) => error.status === 500, alwaysTrue],
            [(error:ApiError) => error.status === 502, alwaysTrue],
            [(error:ApiError) => error.message === 'Abuse rate triggered', alwaysTrue],
            [compose(test(/ENOTFOUND|ECONNRESET/), propOr('', 'code')), alwaysTrue],
            [compose(test(/fetch/i), propOr('', 'message')), alwaysTrue],
            [alwaysTrue, alwaysFalse],
        ])
        const getErrorMessage:(error: ApiError) => { level: string, message: string } = cond([
            [
                hasTriggeredAbuse,
                always({
                    level: 'warn',
                    message: 'You may have triggered the api\'s abuse detection, please wait a minute before trying again',
                }),
            ],
            [
                compose(test(/50\d/i), propOr('', 'status')),
                always({
                    level: 'error',
                    message: 'GitHub API 500 error, could be CORS or rate limiting',
                }),
            ],
            [
                (error) => error.status === 401,
                always({
                    level: 'error',
                    message: 'GitHub token does not have correct settings, please see README',
                }),
            ],
            [
                compose(test(/40\d/i), propOr('', 'status')),
                (error) => ({
                    level: 'error',
                    message: `Auth error: ${error.message || 'UNKOWN'}`,
                }),
            ],
            [
                (error) => error.status === undefined,
                always({
                    level: 'error',
                    message: 'Error while processing data after, please check the console',
                }),
            ],
            [
                alwaysTrue,
                (error) => ({
                    level: 'error',
                    message: `ERROR: ${error.message || 'UNKOWN'}`,
                }),
            ],
        ])

        const errorMessage = getErrorMessage(error)

        if (hasTriggeredAbuse(error)) {
            return pauseThenRetry({ fetchInfo, queryInfo, dispatch }, results)
        } else {
            throw new Error(errorMessage.message)
        }
    }
}

export default api