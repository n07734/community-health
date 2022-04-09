import { pathOr, propOr } from 'ramda'
import batch from './batch'

import {
    commentsQuery,
    reviewsQuery,
    reviewCommentsQuery,
} from './queries'

// TODO: make this file more understandable
// TODO: retry errored fill
const fillData = apiCall => {
    const fillByType = (type) => {

        const fillersByType = {
            'pullRequests': [
                pullRequestsComments,
                pullRequestsReviews,
            ],
            'pullRequestReviewComments': [
                allPullRequestReviewsComments,
            ],
            'batchedQuery': [
                pullRequestsComments,
                pullRequestsReviews,
            ],
        }

        const fillers = fillersByType[type] || []

        return (data) => fillers.length
            ? Promise.all(
                fillers
                    .map((filler) => filler(data))
            )
                .then((resolvedFillers) => resolvedFillers
                    .reduce((currentItem, applyFillerResult) => applyFillerResult(currentItem), data)
                )
            : data
    }

    const recursiveFiller = makeQuery => (queryInfo = {}) => async (currentResults = []) => {
        const {
            hasNextPage: currentHasNextPage,
        } = queryInfo

        const {
            query,
            resultInfo,
            fillerType,
        } = makeQuery(queryInfo)

        const newResult = currentHasNextPage
            ? await apiCall(query)
            : {}

        const {
            results = [],
            hasNextPage: newHasNextPage,
            nextArgs,
        } = resultInfo(newResult)

        const updatedData = [
            ...currentResults,
            ...results,
        ]

        return newHasNextPage
            ? recursiveFiller(makeQuery)(nextArgs)(updatedData)
            : await fillByType(fillerType)(updatedData)
    }

    const updateRawData = (rawData = {}) => key => newData => {
        const updatedNode = Object.assign(rawData.node, { [key]: newData })

        return Object.assign(rawData, { node: updatedNode })
    }

    const getQueryInfo = key => data => ({
        nodeId: pathOr('', ['node', 'id'], data),
        cursor: pathOr('', ['node', key, 'pageInfo', 'endCursor'], data),
        hasNextPage: pathOr(false, ['node', key, 'pageInfo', 'hasNextPage'], data),
    })

    const allPullRequestReviewsComments = async(data = []) => {
        const getAllReviewComments = async(review) => {
            const currentReviewComments = pathOr([], ['node', 'comments', 'edges'], review)
            const reviewCommentsQueryInfo = getQueryInfo('comments')(review)

            const allReviewComments = await recursiveFiller(reviewCommentsQuery)(reviewCommentsQueryInfo)(currentReviewComments)

            return updateRawData(review)('comments')({ edges: allReviewComments })
        }
        const updatedReviewComments = await batch(data, getAllReviewComments, 10)

        return () => updatedReviewComments
    }

    const pullRequestsReviews = async(data) => {
        const pullRequests = pathOr([], ['data', 'result', 'pullRequests', 'edges'], data)

        const getAllPullRequestReviews = async (pullRequest) => {
            const currentReviews = pathOr([], ['node','reviews','edges'], pullRequest)
            const reviewsQueryInfo = getQueryInfo('reviews')(pullRequest)

            const allReviews = await recursiveFiller(reviewsQuery)(reviewsQueryInfo)(currentReviews)

            return {
                nodeId: pathOr('', ['node', 'id'], pullRequest),
                results: { edges: allReviews },
            }
        }
        const allPullRequestsReviews = await batch(pullRequests, getAllPullRequestReviews, 10)

        return (data) => {
            const updatedpullRequestsData = updatePullRequests(data)('reviews')(allPullRequestsReviews)

            return {
                data: Object.assign(propOr({}, 'data', data),
                    {
                        result: Object.assign(pathOr(
                            {
                                pullRequests: updatedpullRequestsData,
                            },
                            ['data', 'result'],
                            data,
                        )),
                    }
                ),
            }
        }
    }

    const updatePullRequests = data =>  key => pullRequestsItems => {
        const pullRequestsData = pathOr({}, ['data', 'result', 'pullRequests'], data)
        const currentPullRequests = pathOr([], ['data', 'result', 'pullRequests', 'edges'], data)

        const mergedPullRequests = currentPullRequests
            .map((currentPullRequest) => {
                const nodeId = pathOr('', ['node', 'id'], currentPullRequest)
                const item = pullRequestsItems
                    .find(x => x.nodeId === nodeId)

                return item
                    ? updateRawData(currentPullRequest)(key)(item.results)
                    : currentPullRequest

            })

        return Object.assign(pullRequestsData, { edges: mergedPullRequests })
    }

    const pullRequestsComments = async(data) => {
        const pullRequests = pathOr([], ['data', 'result', 'pullRequests', 'edges'], data)

        const getAllPullRequestComments = async (pullRequest) => {
            const currentComments = pathOr([], ['node', 'comments', 'edges'], pullRequest)
            const commentsQueryInfo = getQueryInfo('comments')(pullRequest)

            const allComments = await recursiveFiller(commentsQuery)(commentsQueryInfo)(currentComments)

            return {
                nodeId: pathOr('', ['node','id'], pullRequest),
                results: { edges: allComments },
            }
        }

        const allPullRequestsComments = await batch(pullRequests, getAllPullRequestComments, 10)

        return (data) => {
            const updatedpullRequestsData = updatePullRequests(data)('comments')(allPullRequestsComments)

            return {
                data: Object.assign(propOr({}, 'data', data),
                    {
                        result: Object.assign(pathOr(
                            {
                                pullRequests: updatedpullRequestsData,
                            },
                            ['data', 'result'],
                            data
                        )),
                    }
                ),
            }
        }
    }

    return fillByType
}

export default fillData
