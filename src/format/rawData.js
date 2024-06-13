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
import filterByUntilDate from './filterByUntilDate'
import { sumKeysValue } from '../utils'

const formatCommentersObject = paths => items => {
    const commenters = {}
    items
        .forEach((item) => {
            const user = path(paths, item)
            commenters[user] = (commenters[user] || 0) + 1
        })

    return commenters
}

const formatCommenters = formatCommentersObject(['node', 'author', 'login'])

const formatSentimentsCommenters = items => {
    const commenters = {}
    items
        .forEach(({author = '', score = 0}) => {
            commenters[author] = (commenters[author] || 0) + score
        })

    return commenters
}

const formatSentiments = (comments = []) => {
    const sentiment = new Sentiment();

    const sentimental = comments
        .map(comment => {
            const body = pathOr('',['node', 'body'], comment)
            const commentAuthor = pathOr('', ['node', 'author', 'login'], comment)

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

const getAllCodeComments = (data) => {
    const allReviews = pathOr([], ['node', 'reviews', 'edges'], data)

    const allCodeComments = []
    allReviews
        .forEach((review) => {
            const comments = pathOr([], ['node', 'comments', 'edges'], review)
            allCodeComments.push(...comments)
        })

    return allCodeComments
}

const filterForUsers = users => item => users.includes(path(['node', 'author', 'login'], item))
const filterOutUsers = users => item => {
    const isAllowedUser = !filterForUsers(users)(item)
    const notGitAppComment = !/\/apps\//.test(pathOr('', ['node', 'author', 'url'], item))

    return notGitAppComment && isAllowedUser
}

const formatComments = (type = '', exclude, data) => {
    const author = pathOr('', ['node', 'author', 'login'], data)

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
    const allComments = commentsMap[type]

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

const formatAllComments = (exclude, data) => {
    const generalCommentsInfo = formatComments('general',exclude, data)
    const codeCommentsInfo = formatComments('code', exclude, data)
    const collatedCommentsInfo = formatComments('all', exclude, data)

    return {
        ...generalCommentsInfo,
        ...codeCommentsInfo,
        ...collatedCommentsInfo,
    }
}

const formatApprovals = (data) => {
    const reviews = pathOr([], ['node', 'reviews', 'edges'], data)
    const ghApprovals = reviews
        .filter(x => path(['node', 'state'], x) === 'APPROVED')

    const ghApprovers = formatCommenters(ghApprovals)

    return {
        approvals: ghApprovals.length,
        approvers: ghApprovers,
    }
}

const prData = (exclude = []) => (data = {}) => {
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
const dateSort = (dateKey = '', sortDirection) => ({ [dateKey]: a }, { [dateKey]: b }) => sortDirection === 'DESC'
    ? new Date(a).getTime() > new Date(b).getTime()
    : new Date(a).getTime() - new Date(b).getTime()

const formatPullRequests = ({ excludeIds = [] } = {}, results = []) => {
    const pullRequests = compose(
        map(prData(excludeIds)),
        flatten,
        map(pathOr([], ['data', 'result', 'pullRequests', 'edges'])),
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

const filterByUsersInfo = (fetchInfo = {}, prs = []) => {
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

const filterSortPullRequests = ({ excludeIds = [] }, { reportStartDate = '', reportEndDate = '' }, allPullRequests = []) => {
    const filteredPRs = []
    const remainingPRs = compose(
        sort(dateSort('mergedAt', 'ASC')),
        filter(item => {
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

const filterSortItems = (dateKey = '') => ({ sortDirection }, untilDate, allIssues = []) => {
    const filteredIssues = []
    const remainingIssues = compose(
        sort(dateSort(dateKey, 'ASC')),
        filter(item => {
            const keepItem = filterByUntilDate([dateKey], sortDirection, untilDate)(item)

            !keepItem && filteredIssues.push(item)
            return keepItem
        }),
    )(allIssues)

    return [remainingIssues, filteredIssues]
}

const filterSortIssues = filterSortItems('mergedAt')

const filterSortReleases = filterSortItems('date')

const formatIssue = (data) => {
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const closedAt = pathOr('', ['node', 'closedAt'], data)
    const title = pathOr('', ['node', 'title'], data)
    const url = pathOr('', ['node', 'url'], data)
    const labels = pathOr([], ['node', 'labels', 'edges'], data)

    return {
        mergedAt: createdAt,
        age: differenceInDays(new Date(closedAt), new Date(createdAt)) || 1,
        url,
        isBug: /bug/i.test(title) || labels.some(x => /bug/i.test(path(['node', 'name'], x))),
    }
}

const formatIssues = compose(
    map(formatIssue),
    filter(x => x),
    flatten,
    map(pathOr([], ['data', 'result', 'issues', 'edges'])),
)

const formatRelease = (data) => {
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const tag = pathOr('', ['node', 'tag', 'name'], data)

    return {
        date: createdAt,
        description: tag,
    }
}

const formatReleases = compose(
    map(formatRelease),
    filter(x => x),
    flatten,
    map(pathOr([], ['data', 'result', 'releases', 'edges'])),
)

export {
    formatPullRequests,
    filterSortPullRequests,
    filterByUsersInfo,
    formatIssues,
    filterSortIssues,
    filterSortReleases,
    formatReleases,
}
