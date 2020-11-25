import _get from 'lodash/get'
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

    const recursiveFiller = makeQuery => (queryInfo = {}) => (accumulator = []) => {
        const {
            hasNextPage: currentHasNextPage,
        } = queryInfo

        const {
            query,
            resultInfo,
            fillerType,
        } = makeQuery(queryInfo)

        const resolver = async(nextResult) => {
            const {
                results = [],
                hasNextPage: newHasNextPage,
                nextArgs,
            } = resultInfo(nextResult)

            const updatedData = [
                ...accumulator,
                ...results,
            ]

            return newHasNextPage
                ? recursiveFiller(makeQuery)(nextArgs)(updatedData)
                : await fillByType(fillerType)(updatedData)
        }

        return currentHasNextPage
            ? apiCall(query)(resolver)((error) => {
                throw error
            })
            : accumulator
    }

    const updateRawData = (rawData = {}) => key => newData => {
        const updatedNode = Object.assign(rawData.node, { [key]: newData })

        return Object.assign(rawData, { node: updatedNode })
    }

    const getQueryInfo = key => data => ({
        nodeId: _get(data, 'node.id', ''),
        cursor: _get(data, `node.${key}.pageInfo.endCursor`, ''),
        hasNextPage: _get(data, `node.${key}.pageInfo.hasNextPage`, false),
    })

    const allPullRequestReviewsComments = async(data = []) => {
        const getAllReviewComments = async(review) => {
            const currentReviewComments = _get(review, 'node.comments.edges', [])
            const reviewCommentsQueryInfo = getQueryInfo('comments')(review)

            const allReviewComments = await recursiveFiller(reviewCommentsQuery)(reviewCommentsQueryInfo)(currentReviewComments)


            return updateRawData(review)('comments')({ edges: allReviewComments })
        }
        const updatedReviewComments = await batch(data, getAllReviewComments, 10)

        return () => updatedReviewComments
    }

    const pullRequestsReviews = async(data) => {
        const pullRequests = _get(data, 'data.repository.pullRequests.edges', [])

        const getAllPullRequestReviews = async (pullRequest) => {
            const currentReviews = _get(pullRequest, 'node.reviews.edges', [])
            const reviewsQueryInfo = getQueryInfo('reviews')(pullRequest)

            const allReviews = await recursiveFiller(reviewsQuery)(reviewsQueryInfo)(currentReviews)

            return {
                nodeId: _get(pullRequest, 'node.id', ''),
                results: { edges: allReviews },
            }
        }
        const allPullRequestsReviews = await batch(pullRequests, getAllPullRequestReviews, 10)

        return (data) => {
            const updatedpullRequestsData = updatePullRequests(data)('reviews')(allPullRequestsReviews)

            return {
                data: Object.assign(_get(data, 'data', {}),
                    {
                        repository: Object.assign(_get(data, 'data.repository',
                            {
                                pullRequests: updatedpullRequestsData,
                            }
                        )),
                    }
                ),
            }
        }
    }

    const updatePullRequests = data =>  key => pullRequestsItems => {
        const pullRequestsData = _get(data, 'data.repository.pullRequests', {})
        const currentPullRequests = _get(data, 'data.repository.pullRequests.edges', [])

        const mergedPullRequests = currentPullRequests
            .map((currentPullRequest) => {
                const nodeId = _get(currentPullRequest, 'node.id', '')
                const item = pullRequestsItems
                    .find(x => x.nodeId === nodeId)

                return item
                    ? updateRawData(currentPullRequest)(key)(item.results)
                    : currentPullRequest

            })

        return Object.assign(pullRequestsData, { edges: mergedPullRequests })
    }

    const pullRequestsComments = async(data) => {
        const pullRequests = _get(data, 'data.repository.pullRequests.edges', [])

        const getAllPullRequestComments = async (pullRequest) => {
            const currentComments = _get(pullRequest, 'node.comments.edges', [])
            const commentsQueryInfo = getQueryInfo('comments')(pullRequest)

            const allComments = await recursiveFiller(commentsQuery)(commentsQueryInfo)(currentComments)

            return {
                nodeId: _get(pullRequest, 'node.id', ''),
                results: { edges: allComments },
            }
        }

        const allPullRequestsComments = await batch(pullRequests, getAllPullRequestComments, 10)

        return (data) => {
            const updatedpullRequestsData = updatePullRequests(data)('comments')(allPullRequestsComments)

            return {
                data: Object.assign(_get(data, 'data', {}),
                    {
                        repository: Object.assign(_get(data, 'data.repository',
                            {
                                pullRequests: updatedpullRequestsData,
                            }
                        )),
                    }
                ),
            }
        }
    }

    return fillByType
}

export default fillData
