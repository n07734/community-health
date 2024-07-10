// TODO: TS add formatted return types
import {
    compose,
    map,
    any,
    flatten,
    filter,
    path,
    pathOr,
    propOr,
    sort,
} from 'ramda'
import {
    differenceInDays,
    isAfter,
    isBefore,
} from 'date-fns'

import Sentiment from 'sentiment'
import { sumKeysValue } from '../utils'
import { Issue } from '../types/FormattedData'
import { ObjNumbers } from '../types/Components'
import { SortDirection } from '../types/Querys'
import { FetchInfo } from '../types/State'

const formatCommentersObject = (paths: string[]) => (items: any[]) => {
    const commenters:ObjNumbers = {}
    items
        .forEach((item) => {
            const user = path(paths, item) as string
            commenters[user] = (commenters[user] || 0) + 1
        })

    return commenters
}

const formatCommenters = formatCommentersObject(['node', 'author', 'login'])

const formatSentimentsCommenters = (items: any[]) => {
    const commenters:ObjNumbers = {}
    items
        .forEach(({author = '', score = 0}) => {
            commenters[author] = (commenters[author] || 0) + score
        })

    return commenters
}

const formatSentiments = (comments: any[] = []) => {
    const sentiment = new Sentiment();

    const sentimental: { author: string, score: number}[] = comments
        .map((comment:any) => {
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

const getAllCodeComments = (data: RawData) => {
    const allReviews = data?.node?.reviews?.edges || []

    const allCodeComments: any[] = []
    allReviews
        .forEach((review: any) => {
            const comments = review?.node?.comments?.edges || []
            allCodeComments.push(...comments)
        })

    return allCodeComments
}

const filterForUsers = (users: string[]) => (item: RawItem) => users.includes(item?.node?.author?.login)
const filterOutUsers = (users: string[]) => (item: RawItem) => {
    const isAllowedUser = !filterForUsers(users)(item)
    const notGitAppComment = !/\/apps\//.test(item?.node?.author?.url || '')

    return notGitAppComment && isAllowedUser
}

type FormatTypes = 'general' | 'code' | 'all'
const formatComments = (type:FormatTypes, exclude: string[], data: RawData) => {
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

const formatAllComments = (exclude: string[], data: RawData) => {
    const generalCommentsInfo = formatComments('general',exclude, data)
    const codeCommentsInfo = formatComments('code', exclude, data)
    const collatedCommentsInfo = formatComments('all', exclude, data)

    return {
        ...generalCommentsInfo,
        ...codeCommentsInfo,
        ...collatedCommentsInfo,
    }
}

const formatApprovals = (data: RawData) => {
    const reviews = data?.node?.reviews?.edges || []
    const ghApprovals: any[] = reviews
        .filter((review: any) => review?.node?.state === 'APPROVED')

    const ghApprovers = formatCommenters(ghApprovals)

    return {
        approvals: ghApprovals.length,
        approvers: ghApprovers,
    }
}

const prData = (exclude: string[] = []) => (data: RawData = {}) => {
    const org = pathOr('', ['node', 'repository', 'owner', 'login'], data)
    const repo = pathOr('', ['node', 'repository', 'name'], data)
    const author = pathOr('', ['node', 'author', 'login'], data)
    const authorUrl = pathOr('', ['node', 'author', 'url'], data)
    const url = pathOr('', ['node', 'url'], data)
    const additions = pathOr(0, ['node', 'additions'], data)
    const deletions = pathOr(0, ['node', 'deletions'], data)
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const mergedAt = pathOr('', ['node', 'mergedAt'], data)
    const committedDate = data?.node?.commits?.[0]?.edges?.[0]?.node?.committedDate || ''

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

    return prInfo
}

type DateKeys = 'mergedAt' | 'createdAt' | 'date'
const dateSort = (dateKey: DateKeys, sortDirection: SortDirection) => (aObj: any, bObj: any) => {
    const a = aObj[dateKey]
    const b = bObj[dateKey]
    return sortDirection === 'DESC'
        ? new Date(b).getTime() - new Date(a).getTime()
        : new Date(a).getTime() - new Date(b).getTime()
}

const formatPullRequests = ({ excludeIds }: { excludeIds: string[] } = { excludeIds: []}, results: any[] = []) => {
    const pullRequests = compose(
        map(prData(excludeIds)),
        flatten,
        map((result: any) => result?.data?.result?.pullRequests?.edges
            || result?.data?.result?.edges),
    )(results)

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

const filterByUsersInfo = (fetchInfo:FetchInfo, prs: any[] = []) => {
    const usersInfo = fetchInfo.usersInfo || {}
    const filteredItems = prs
        .filter((pr = {}) => {
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

const filterSortPullRequests = ({ excludeIds = [] }: { excludeIds: string[] }, { reportStartDate = '', reportEndDate = '' }, allPullRequests = []) => {
    const filteredPRs: any[] = []
    const remainingPRs = compose(
        sort(dateSort('mergedAt', 'ASC')),
        filter((item: any) => {
            const author = propOr('', 'author', item)
            const hasExcludedAuthor = any(y => y === author, ['GIT_APP_PR', ...excludeIds])
            const prDate = item.mergedAt
            const shouldFilterIn = isAfter(new Date(prDate), new Date(reportStartDate)) && isBefore(new Date(prDate), new Date(reportEndDate))
            const keepItem = shouldFilterIn && !hasExcludedAuthor

            !keepItem && filteredPRs.push(item)
            return keepItem
        }),
    )(allPullRequests)

    return [remainingPRs, filteredPRs]
}

const filterSortItems = (dateKey:DateKeys) => ({ reportStartDate = '', reportEndDate = '' }, allIssues: any[] = []) => {
    const filteredIssues: any[] = []
    const remainingIssues = compose(
        sort(dateSort(dateKey, 'ASC')),
        filter((item: any) => {
            const itemDate = item?.[dateKey]
            const keepItem = isAfter(new Date(itemDate), new Date(reportStartDate)) && isBefore(new Date(itemDate), new Date(reportEndDate))

            !keepItem && filteredIssues.push(item)
            return keepItem
        }),
    )(allIssues)

    return [remainingIssues, filteredIssues]
}

const filterSortIssues = filterSortItems('mergedAt')

const filterSortReleases = filterSortItems('date')

const formatIssue = (data: RawData): Issue => {
    const createdAt = data?.node?.createdAt || ''
    const closedAt = data?.node?.closedAt || ''
    const title = data?.node?.title || ''
    const url = data?.node?.url || ''
    const labels = data?.node?.labels?.edges || []

    return {
        mergedAt: createdAt,
        age: differenceInDays(new Date(closedAt), new Date(createdAt)) || 1,
        url,
        isBug: /bug/i.test(title) || labels.some((label: any) => /bug/i.test(label?.node?.name)),
    }
}

const formatIssues = (data: any[] = []) => {
    const rawResults = data
        .map((dataItem: any) => dataItem?.data?.result?.issues?.edges || [])

    const flatRaw = flatten(rawResults)
    const filteredItems = flatRaw
        .filter((x: any) => x)

    const formattedItems = filteredItems
        .map((item:any) => formatIssue(item))

    return formattedItems
}

const formatRelease = (data: RawData) => {
    const createdAt = data?.node?.createdAt || ''
    const tag = data?.node?.tag?.name || ''

    return {
        date: createdAt,
        description: tag,
    }
}

const formatReleases = (data: any[] = []) => {
    const rawResults = data
        .map((dataItem: any) => dataItem?.data?.result?.releases?.edges || [])

    const flatRaw = flatten(rawResults)
    const filteredItems = flatRaw
        .filter((x: any) => x)

    const formattedItems = filteredItems
        .map((item:any) => formatRelease(item))

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
