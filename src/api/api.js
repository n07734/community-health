// TODO: Think more about if this should maintain github api data structures
// TODO: add tests
import {
    always,
    cond,
    propOr,
    propEq,
    mergeDeepRight,
    test,
    T as alwaysTrue,
    F as alwaysFalse,
} from 'ramda'
import { compose } from 'redux'

import fillData from './fillers'
import types from '../state/types'

const parseJSON = response => new Promise((resolve, reject) => {
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

const apiCall = fetchInfo => query =>
    fetch((fetchInfo.enterpriseAPI || 'https://api.github.com/graphql'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fetchInfo.token}`,
        },
        body: JSON.stringify({ query }),
    })
        .then(parseJSON)

const shouldGetNextPage = (hasNextPage, { amountOfData }) => cond([
    [always(hasNextPage === false), alwaysFalse],
    [always(hasNextPage && Number.isInteger(amountOfData) && amountOfData >= 1), alwaysTrue],
    [always(hasNextPage && amountOfData === 'all'), alwaysTrue],
    [alwaysTrue, alwaysFalse],
])();

const pause = (ms = 30000) => new Promise(resolve => setTimeout(() => resolve(), ms))
let numRateTriggers = 0

const pauseThenRetry = async(apiInfo, results) => {
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
        }
}

const api = async({ fetchInfo, queryInfo, dispatch = () => {} }, results = []) => {
    const {
        query,
        resultInfo,
        fillerType,
        getFetchStatus,
    } = queryInfo(fetchInfo)

    const fetchStatus = getFetchStatus(results)
    dispatch({
        type: types.FETCH_STATUS,
        payload: fetchStatus,
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

        const updatedFetchInfo = mergeDeepRight(fetchInfo, nextPageInfo)

        return shouldGetNextPage(hasNextPage, updatedFetchInfo)
            ? api({ fetchInfo: updatedFetchInfo, queryInfo, dispatch }, updatedResults)
            : {
                fetchInfo: updatedFetchInfo,
                results: updatedResults,
            }
    } catch (error) {
        const hasTriggeredAbuse = cond([
            [triggeredAbuseRate, alwaysTrue],
            [triggeredJsonError, alwaysTrue],
            [propEq('status', 500), alwaysTrue],
            [propEq('status', 502), alwaysTrue],
            [propEq('message', 'Abuse rate triggered'), alwaysTrue],
            [compose(test(/ENOTFOUND|ECONNRESET/), propOr('', 'code')), alwaysTrue],
            [compose(test(/fetch/i), propOr('', 'message')), alwaysTrue],
            [alwaysTrue, alwaysFalse],
        ])
        const getErrorMessage = cond([
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
                propEq('status', 401),
                always({
                    level: 'error',
                    message: 'GitHub token does not have correct settings, please see README',
                }),
            ],
            [
                compose(test(/40\d/i), propOr('', 'status')),
                always({
                    level: 'error',
                    message: `Auth error: ${error.message || 'UNKOWN'}`,
                }),
            ],
            [
                propEq('status', undefined),
                always({
                    level: 'error',
                    message: 'Error while processing data after, please check the console',
                }),
            ],
            [
                alwaysTrue,
                always({
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