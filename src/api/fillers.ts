import { pathOr } from 'ramda'
import batch from './batch'
import { FilterType, MakeQuery } from '../types/Querys'
import { RawPullRequest, RawPullRequests } from '../types/rawData'

import {
    commentsQuery,
    reviewsQuery,
    reviewCommentsQuery,
} from './queries'

const getData = (type: string, data: any[]) => {
    const pathMap: { [key: string]: string[] } = {
        'org': ['data', 'organization', 'repositories', 'edges'],
        'team': ['data', 'organization', 'team', 'members', 'edges'],
    }

    const path = pathMap[type]
    return  path
        ? pathOr([], path, data)
        : data
}

// TODO: make this file more understandable
// TODO: retry errored fill
const fillData = (apiCall: any) => {
    const fillByType = (type: FilterType) => {

        const fillersByType: { [key: string]: ((data: any) => Promise<any>)[] } = {
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

        return (data: any) => fillers.length
            ? Promise.all(
                fillers
                    .map((filler) => filler(data)),
            )
                .then((resolvedFillers) => resolvedFillers
                    .reduce((currentItem, applyFillerResult) => applyFillerResult(currentItem), data),
                )
            : getData(type, data)
    }

    const recursiveFiller = (makeQuery:MakeQuery) => (queryInfo: { hasNextPage: boolean }) => async (currentResults: any[] = []): Promise<any[]> => {
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

        return newHasNextPage && fillerType
            ? recursiveFiller(makeQuery)(nextArgs)(updatedData)
            : await fillByType(fillerType as FilterType)(updatedData)
    }

    type RawData = {
        node: object
    }

    const updateRawData = (rawData: RawData) => (key: string) => (newData: any) => {
        const updatedNode = Object.assign(rawData.node, { [key]: newData })

        return Object.assign(rawData, { node: updatedNode })
    }

    type Key = 'comments' | 'reviews'
    const getQueryInfo = (key:Key) => (data: RawPullRequest) => ({
        nodeId: data?.node?.id || '',
        cursor: data?.node?.[key]?.pageInfo?.endCursor || '',
        hasNextPage: data?.node?.[key]?.pageInfo?.hasNextPage || false,
    })

    const allPullRequestReviewsComments = async(data: RawPullRequest[] = []) => {
        const getAllReviewComments = async(review: RawPullRequest) => {
            const currentReviewComments = review?.node?.comments?.edges || []
            const reviewCommentsQueryInfo = getQueryInfo('comments')(review)

            const allReviewComments = await recursiveFiller(reviewCommentsQuery)(reviewCommentsQueryInfo)(currentReviewComments)

            return updateRawData(review)('comments')({ edges: allReviewComments })
        }
        const updatedReviewComments = await batch(data, getAllReviewComments, 5)

        return () => updatedReviewComments
    }

    const pullRequestsReviews = async(data: RawPullRequests) => {
        const pullRequests = data?.data?.result?.pullRequests?.edges || []

        const getAllPullRequestReviews = async (pullRequest: RawPullRequest) => {
            const currentReviews = pullRequest?.node?.reviews?.edges || []
            const reviewsQueryInfo = getQueryInfo('reviews')(pullRequest)

            const allReviews = await recursiveFiller(reviewsQuery)(reviewsQueryInfo)(currentReviews)

            return {
                nodeId: pullRequest?.node?.id,
                results: { edges: allReviews },
            }
        }
        const allPullRequestsReviews = await batch(pullRequests, getAllPullRequestReviews, 5) as PrItems

        return (data: RawPullRequests) => {
            const updatedPullRequestsData = updatePullRequests(data)('reviews')(allPullRequestsReviews)
            return {
                data: Object.assign(data?.data || {},
                    {
                        result: Object.assign(pathOr(
                            {
                                pullRequests: updatedPullRequestsData,
                            },
                            ['data', 'result'],
                            data,
                        )),
                    },
                ),
            }
        }
    }

    type PrItems = { nodeId: string, results: [] }[]
    const updatePullRequests = (data: RawPullRequests) =>  (key: string) => (pullRequestsItems: PrItems) => {
        const pullRequestsData = data?.data?.result?.pullRequests || {}
        const currentPullRequests = data?.data?.result?.pullRequests?.edges || []

        const mergedPullRequests = currentPullRequests
            .map((currentPullRequest:RawPullRequest) => {
                const nodeId = currentPullRequest?.node?.id || ''
                const item = pullRequestsItems
                    .find(x => x.nodeId === nodeId)

                return item
                    ? updateRawData(currentPullRequest)(key)(item.results)
                    : currentPullRequest

            })

        return Object.assign(pullRequestsData, { edges: mergedPullRequests })
    }

    const pullRequestsComments = async(data: RawPullRequests) => {
        const pullRequests = data?.data?.result?.pullRequests?.edges || []

        const getAllPullRequestComments = async (pullRequest: RawPullRequest) => {
            const currentComments = pullRequest?.node?.comments?.edges || []
            const commentsQueryInfo = getQueryInfo('comments')(pullRequest)

            const allComments = await recursiveFiller(commentsQuery)(commentsQueryInfo)(currentComments)

            return {
                nodeId: pullRequest?.node?.id || '',
                results: { edges: allComments },
            }
        }

        const allPullRequestsComments = await batch(pullRequests, getAllPullRequestComments, 5) as PrItems

        return (data:RawPullRequests) => {
            const updatedpullRequestsData = updatePullRequests(data)('comments')(allPullRequestsComments)

            return {
                data: Object.assign(data?.data || {},
                    {
                        result: Object.assign(
                            data?.data?.result || {
                                pullRequests: updatedpullRequestsData,
                            },
                        ),
                    },
                ),
            }
        }
    }

    return fillByType
}

export default fillData