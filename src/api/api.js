// TODO: Think more about if this should maintain github api data structures
// TODO: add tests
import {
    always,
    cond,
    propOr,
    propEq,
    mergeDeepRight,
    T as alwaysTrue,
    F as alwaysFalse,
} from 'ramda'

import fillData from './fillers'
import { compose } from 'redux'

const parseJSON = response => new Promise((resolve, reject) => {
    response.json()
        .then(data => response.status === 200
            ? resolve(data)
            : reject(Object.assign(data, { status: response.status }))
        )
        .catch(error => {
            error.status = response.status
            reject(error)
        })
})

const triggeredAbuseRate = ({ message = '' }) =>/You have triggered an abuse detection mechanism/.test(message)

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
]);

const pause = (ms = 3000) => new Promise(resolve => setTimeout(resolve, ms))
let numRateTriggers = 0

const pauseThenRetry = async(fetchInfo, queryInfo, results) => {
    console.log('-=-=--paused');
    await pause();
    ++numRateTriggers
    return numRateTriggers <= 10
        ? api(fetchInfo)(queryInfo, results)
        : {
            level: 'error',
            message: 'Hit rate limit too many times'
        }
}

// TODO: Do not like dispatch here or using state
// do this before
const api = fetchInfo => async(queryInfo, results = []) => {
    const {
        query,
        resultInfo,
        fillerType,
    } = queryInfo(fetchInfo)
    console.log('-=-=--query', query)

    const apiCallWithToken = apiCall(fetchInfo)
    try {
        const result = await apiCallWithToken(query)
        if (triggeredAbuseRate(result)) {
            throw new Error('Abuse rate triggered');
        }

        const fullData = await fillData(apiCallWithToken)(fillerType)(result)
        const updatedResults = [
            ...results,
            fullData
        ]

        const {
            hasNextPage,
            nextPageInfo,
        } = resultInfo(result)

        const updatedFetchInfo = mergeDeepRight(fetchInfo, nextPageInfo)

        return shouldGetNextPage(hasNextPage, updatedFetchInfo)(fullData)
            ? api(updatedFetchInfo)(queryInfo, updatedResults)
            : {
                fetchInfo: updatedFetchInfo,
                results: updatedResults,
            }
    } catch (error) {
        console.log('-=-=--api error', error)
        const hasTriggeredAbuse = cond([
            [triggeredAbuseRate, alwaysTrue],
            [propEq('status', 500), alwaysTrue],
            [propEq('status', 502), alwaysTrue],
            [propEq('message', 'Abuse rate triggered'), alwaysTrue],
            [compose(/ENOTFOUND|ECONNRESET/.test, propOr('', 'code')), alwaysTrue],
            [compose(/fetch/i.test, propOr('', 'message')), alwaysTrue],
            [alwaysTrue, alwaysFalse],
        ])
        const getErrorMessage = cond([
            [
                hasTriggeredAbuse,
                always({
                    level: 'warn',
                    message: 'You may have triggered the api\'s abuse detection, please wait a minute before trying again',
                })
            ],
            [
                propEq('status', 401),
                always({
                    level: 'error',
                    message: 'GitHub token does not have correct settings, please see README',
                }),
            ],
            [
                compose(/40\d/i.test, propOr('', 'status')),
                always({
                    level: 'error',
                    message: `Auth error: ${error.message || 'UNKOWN'}`,
                })
            ],
            [
                alwaysTrue,
                always({
                    level: 'error',
                    message: `ERROR: ${error.message || 'UNKOWN'}`,
                })
            ]
        ]);

        const errorMessage = getErrorMessage(error)
        console.log('-=-=--errorMessage', errorMessage)

        return hasTriggeredAbuse(error)
            ? pauseThenRetry(fetchInfo, queryInfo, results)
            : {
                ...errorMessage,
                fetchInfo: fetchInfo,
                results: results,
            }
    }
}

export default api