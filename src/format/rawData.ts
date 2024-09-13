// TODO: TS add formatted return types
import flatten from 'ramda/es/flatten'
import path from 'ramda/es/path'
import pathOr from 'ramda/es/pathOr'
import propOr from 'ramda/es/propOr'
import differenceInDays from 'date-fns/differenceInDays'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import Sentiment from 'sentiment'

import { EventInfo, Issue, PullRequest } from '../types/FormattedData'
import { Comment, Review, SortDirection } from '../types/Queries'
import { FetchInfo } from '../types/State'
import { DateKeys, RawDataItem, RawDataPRSearchResult, RawDataResult, RawPullRequest } from '../types/RawData'

import { sumKeysValue } from '../utils'

const formatCommentersObject = (paths: string[]) => (items: Comment[] | Review[]) => {
    const commenters:Record<string, number> = {}
    items
        .forEach((item) => {
            const user = path(paths, item) as string
            commenters[user] = (commenters[user] || 0) + 1
        })

    return commenters
}

const formatCommenters = formatCommentersObject(['node', 'author', 'login'])

type SentimentItem = {
    author: string
    score: number
}
const formatSentimentsCommenters = (items: SentimentItem[]) => {
    const commenters:Record<string, number> = {}
    items
        .forEach(({author = '', score = 0}) => {
            commenters[author] = (commenters[author] || 0) + score
        })

    return commenters
}

const formatSentiments = (comments: Comment[] = []) => {
    const sentiment = new Sentiment();

    const sentimental: SentimentItem[] = comments
        .map((comment) => {
            const body = comment?.node?.body || ''
            const commentAuthor = comment?.node?.author?.login || ''

            return {
                author: commentAuthor,
                score: sentiment.analyze(body).score,
            }
        })

    return {
        sentimentScore: sumKeysValue('score')(sentimental),
        sentiments: formatSentimentsCommenters(sentimental),
    }
}

const getAllCodeComments = (data: RawPullRequest) => {
    const allReviews = data?.node?.reviews?.edges || []

    const allCodeComments: Comment[] = []
    allReviews
        .forEach((review) => {
            const comments = (review?.node?.comments?.edges || []) as Comment[]
            allCodeComments.push(...comments)
        })

    return allCodeComments
}

const filterForUsers = (users: string[]) => (item: Comment) => users.includes(item?.node?.author?.login)
const filterOutUsers = (users: string[]) => (item: Comment) => {
    const isAllowedUser = !filterForUsers(users)(item)
    const notGitAppComment = !/\/apps\//.test(item?.node?.author?.url || '')

    return notGitAppComment && isAllowedUser
}

type FormatTypes = 'general' | 'code' | 'all'
const formatComments = (type:FormatTypes, exclude: string[], data: RawPullRequest) => {
    const author = data?.node?.author?.login

    const generalComments = pathOr([], ['node', 'comments', 'edges'], data)
    const codeComments = getAllCodeComments(data)
    const commentsMap = {
        general: generalComments,
        code: codeComments,
        all: [
            ...codeComments,
            ...generalComments,
        ],
    }
    const allComments = commentsMap[type] || []

    const comments = allComments
        .filter(filterOutUsers([...exclude, author]))

    const {
        sentimentScore = 0,
        sentiments = {},
    } = formatSentiments(comments)

    const commentsAuthor = allComments
        .filter(filterForUsers([author]))
    const {
        sentimentScore: authorSentimentScore = 0,
    } = formatSentiments(commentsAuthor)

    const prefix = type === 'all'
        ? 'c'
        : `${type}C`

    return {
        [`${prefix}omments`]: comments.length,
        [`${prefix}ommenters`]: formatCommenters(comments),
        [`${prefix}ommentSentimentScore`]: sentimentScore,
        [`${prefix}ommentSentiments`]: sentiments,
        [`${prefix}ommentsAuthor`]: commentsAuthor.length,
        [`${prefix}ommentAuthorSentimentScore`]: authorSentimentScore,
        [`${prefix}ommentSentimentTotalScore`]: (authorSentimentScore || 0) + (sentimentScore || 0),
    }
}

const formatAllComments = (exclude: string[], data: RawPullRequest) => {
    const generalCommentsInfo = formatComments('general',exclude, data)
    const codeCommentsInfo = formatComments('code', exclude, data)
    const collatedCommentsInfo = formatComments('all', exclude, data)

    return {
        ...generalCommentsInfo,
        ...codeCommentsInfo,
        ...collatedCommentsInfo,
    }
}

const formatApprovals = (data: RawPullRequest) => {
    const reviews = data?.node?.reviews?.edges || []
    const ghApprovals = reviews
        .filter((review) => review?.node?.state === 'APPROVED')

    const ghApprovers = formatCommenters(ghApprovals)

    return {
        approvals: ghApprovals.length,
        approvers: ghApprovers,
    }
}

const prData = (exclude: string[] = [], data: RawPullRequest) => {
    const org = pathOr('', ['node', 'repository', 'owner', 'login'], data)
    const repo = pathOr('', ['node', 'repository', 'name'], data)
    const author = pathOr('', ['node', 'author', 'login'], data)
    const authorUrl = pathOr('', ['node', 'author', 'url'], data)
    const url = pathOr('', ['node', 'url'], data)
    const additions = pathOr(0, ['node', 'additions'], data)
    const deletions = pathOr(0, ['node', 'deletions'], data)
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const mergedAt = pathOr('', ['node', 'mergedAt'], data)
    const committedDate = data?.node?.commits?.edges?.[0]?.node?.commit?.committedDate || ''

    const startDate = isBefore(new Date(committedDate), new Date(createdAt))
        ? committedDate
        : createdAt

    const allCommentsInfo = formatAllComments(exclude, data)

    const {
        approvals,
        approvers,
    } = formatApprovals(data)

    const prInfo = {
        repo,
        org,
        author: /\/apps\//.test(authorUrl)
            ? 'GIT_APP_PR'
            : author,
        url,

        additions,
        deletions,
        prSize: additions + deletions,

        mergedAt,
        cycleTime: differenceInDays(new Date(mergedAt), new Date(startDate)) || 1,
        age: differenceInDays(new Date(mergedAt), new Date(createdAt)) || 1,

        approvals,
        approvers,

        ...allCommentsInfo,
    }

    return prInfo as PullRequest
}

const dateSort = <T>(dateKey: keyof T & DateKeys, sortDirection: SortDirection) => (aObj: T, bObj: T) => {
    const a = aObj[dateKey] as string
    const b = bObj[dateKey] as string
    return sortDirection === 'DESC'
        ? new Date(b).getTime() - new Date(a).getTime()
        : new Date(a).getTime() - new Date(b).getTime()
}

const formatPullRequests = (fetchInfo:FetchInfo, results: RawDataResult[] | RawDataPRSearchResult[] = []) => {
    const { excludeIds = [] } = fetchInfo
    const pullRequests = results
        .map((result) => (
            (result as RawDataResult)?.data?.result?.pullRequests?.edges
            || (result as RawDataPRSearchResult)?.data?.result?.edges),
        )
        .flat()
        .map((rawPr) => prData(excludeIds,rawPr))

    return pullRequests
}

const usersPrWasInTeam = (prMergeDate = '') => ({
    startDate = '',
    endDate = '',
} = {}) => {

    const prDate = new Date(prMergeDate)

    const isAfterStart = !startDate
        ? true
        : isAfter(prDate, new Date(startDate))

    const isBeforeEnd = !endDate
        ? true
        : isBefore(prDate, new Date(endDate))

    return isAfterStart && isBeforeEnd
}

const filterByUsersInfo = (fetchInfo:FetchInfo, prs: PullRequest[] = []) => {
    const usersInfo = fetchInfo.usersInfo || {}
    const filteredItems = prs
        .filter((pr) => {
            const user = pr.author
            const {
                dates = [],
            } = usersInfo[user] || {}

            const wasInTeam = usersPrWasInTeam(pr.mergedAt)

            return dates.length > 0
                ? dates.some(wasInTeam)
                : true
        })

    return filteredItems
}

const filterSortPullRequests = ({ excludeIds = [] }: { excludeIds: string[] }, { reportStartDate = '', reportEndDate = '' }, allPullRequests:PullRequest[] = []) => {
    const filteredPRs: PullRequest[] = []
    const remainingPRs = allPullRequests
        .filter((item) => {
            const author = propOr('', 'author', item)
            const hasExcludedAuthor = ['GIT_APP_PR', ...excludeIds].some(y => y === author)
            const prDate = item.mergedAt
            const shouldFilterIn = isAfter(new Date(prDate), new Date(reportStartDate)) && isBefore(new Date(prDate), new Date(reportEndDate))
            const keepItem = shouldFilterIn && !hasExcludedAuthor

            !keepItem && filteredPRs.push(item)
            return keepItem
        })
        .sort(dateSort('mergedAt', 'ASC'))


    return [remainingPRs, filteredPRs]
}

const filterSortItems = <T>(dateKey: keyof T & DateKeys) => ({ reportStartDate = '', reportEndDate = '' }, allIssues: T[] = []) => {
    const filteredIssues: T[] = []
    const remainingIssues = allIssues
        .filter((item) => {
            const itemDate = item?.[dateKey] as string
            const keepItem = isAfter(new Date(itemDate), new Date(reportStartDate)) && isBefore(new Date(itemDate), new Date(reportEndDate))

            !keepItem && filteredIssues.push(item)
            return keepItem
        })
        .sort(dateSort(dateKey, 'ASC'))

    return [remainingIssues, filteredIssues]
}

const filterSortIssues = filterSortItems<Issue>('mergedAt')

const filterSortReleases = filterSortItems<EventInfo>('date')

const formatIssue = (data: RawDataItem): Issue => {
    const createdAt = data?.node?.createdAt || ''
    const closedAt = data?.node?.closedAt || ''
    const title = data?.node?.title || ''
    const url = data?.node?.url || ''

    type Label = {
        node: {
            name: string
        }
    }
    const labels = (data?.node?.labels?.edges || []) as Label[]

    return {
        mergedAt: createdAt,
        createdAt,
        age: differenceInDays(new Date(closedAt), new Date(createdAt)) || 1,
        url,
        isBug: /bug/i.test(title) || labels.some((label) => /bug/i.test(label?.node?.name)),
    }
}

const formatIssues = (data: RawDataResult[] = []) => {
    const rawResults = data
        .map((dataItem) => dataItem?.data?.result?.issues?.edges || [])

    const flatRaw = flatten(rawResults)
    const filteredItems = flatRaw
        .filter(Boolean)

    const formattedItems = filteredItems
        .map((item) => formatIssue(item))

    return formattedItems
}

const formatRelease = (data: RawDataItem) => {
    const createdAt = data?.node?.createdAt || ''
    const tag = data?.node?.tag?.name || ''

    return {
        date: createdAt,
        description: tag,
    }
}

type Data = {
    data: {
        result: {
            releases: {
                edges: RawDataItem[]
            }
        }
    }
}
const formatReleases = (data: Data[] = []) => {
    const rawResults = data
        .map((dataItem) => dataItem?.data?.result?.releases?.edges || [])

    const flatRaw = flatten(rawResults)
    const filteredItems = flatRaw
        .filter(Boolean)

    const formattedItems = filteredItems
        .map((item) => formatRelease(item))

    return formattedItems
}

export {
    formatPullRequests,
    filterSortPullRequests,
    filterByUsersInfo,
    formatIssues,
    filterSortIssues,
    filterSortReleases,
    formatReleases,
}
