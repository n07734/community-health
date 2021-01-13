// TODO: Think more about if this should maintain github api data structures
// TODO: add tests
import { pathOr, propOr } from 'ramda'
import fillData from './fillers'

import types from '../state/types'

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

const triggeredAbuseRate = ({ message = '' } = {}) => /You have triggered an abuse detection mechanism/.test(message)

const apiCall = request => query => resolver => rejecter =>
    fetch((request.enterpriseAPI || 'https://api.github.com/graphql'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${request.token}`,
        },
        body: JSON.stringify({ query }),
    })
        .then(parseJSON)
        .then(data => triggeredAbuseRate(data)
            ? rejecter(data)
            : resolver(data)
        )
        .catch(rejecter)

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

const api = state => queryInfo => dispatch => {
    dispatch({
        type: types.CLEAR_FETCH_ERROR,
    })

    const {
        query,
        resultInfo,
        fillerType,
        cursorAction,
        hasMoreResults,
    } = queryInfo(state)

    const token = pathOr('', ['fetches', 'token'], state)
    const enterpriseAPI = pathOr('', ['fetches', 'enterpriseAPI'], state)
    const apiCallWithToken = apiCall({ enterpriseAPI, token })

    const { isValid: isValidRequest, error = {}} = validateRequest(state)

    !isValidRequest && dispatch({
        type: types.FETCH_ERROR,
        payload: error,
    })

    // TODO: Not like this, yuck
    const resolver = async(response = {}) => {
        response.errors
            && dispatch({
                type: types.FETCH_ERROR,
                payload: {
                    level: 'error',
                    message: 'Error with graphql query',
                },
            })

        const result = resultInfo(response)

        // TODO: FILLERS HERE SORT OUT RAW and filled data
        // pass in fillers
        const fullData = await fillData(apiCallWithToken)(fillerType)(response)

        // TODO: dispatch should not be in api call need to update this info outside
        cursorAction
            && dispatch({
                type: cursorAction,
                payload: {
                    cursor: pathOr('', ['nextArgs', 'cursor'], result),
                    hasNextPage: propOr(false, 'hasNextPage', result),
                },
            })

        const nextPageInfo = propOr([], 'nextPageInfo', result)
        nextPageInfo
            .map(pageInfo => dispatch({
                type: pageInfo.cursorAction,
                payload: {
                    cursor: pageInfo.cursor,
                    hasNextPage: pageInfo.hasNextPage,
                },
            }))

        return fullData
    }

    const rejecter = (error = {}) => {
        const status = error.status
        const errorMessage = [
            (/ENOTFOUND|ECONNRESET/.test(error.code) || triggeredAbuseRate(error) || status === 502)
                && {
                    level: 'warn',
                    message: 'You may have triggered the api\'s abuse detection, please wait a minute before trying again',
                },
            status === 401
                && {
                    level: 'error',
                    message: 'GitHub token does not have correct settings, please see README',
                },
            /40\d/.test(status)
                && {
                    level: 'error',
                    message: `Auth error: ${error.message || 'UNKOWN'}`,
                },
            {
                level: 'error',
                message: `ERROR: ${error.message || 'UNKOWN'}`,
            },
        ].find(Boolean)

        dispatch({
            type: types.FETCH_ERROR,
            payload: errorMessage,
        })
    }

    return isValidRequest && hasMoreResults
        ? apiCallWithToken(query)(resolver)(rejecter)
        : Promise.resolve()

}

export default api