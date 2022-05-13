import {
    compose,
    map,
    any,
    flatten,
    filter,
    path,
    pathOr,
    sort,
} from 'ramda'
import differenceInDays from 'date-fns/differenceInDays'
import {
    major,
    minor,
    patch,
    prerelease,
} from 'semver'
import Sentiment from 'sentiment'
import filterByUntilDate from './filterByUntilDate'


const formatCommentersObject = paths => items => items
    .reduce((acc, item) => {
        const user = path(paths, item)
        const userCount = (acc[user] || 0) + 1

        return Object.assign(acc, { [user]: userCount })
    }, {})

const formatCommenters = formatCommentersObject(['node', 'author', 'login'])

const formatSentimentsCommenters = items => items
    .reduce((acc, {author = '', score = 0}) => {
        const totalScore = (acc[author] || 0) + score

        return Object.assign(acc, { [author]: totalScore })
    }, {})

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
        sentimentScore: sentimental.reduce((acc, { score = 0 } = {}) => score + acc,0),
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
const filterOutUsers = users => item => !filterForUsers(users)(item)

const formatComments = (type = '', exclude, data) => {
    const author = pathOr('', ['node', 'author', 'login'], data)

    const generalComments = pathOr([], ['node', 'comments', 'edges'], data)
    const codeComments = getAllCodeComments(data)
    const commentsMap = {
        general: generalComments,
        code: codeComments,
        all: [
            ...codeComments,
            ...generalComments
        ]
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
    const url = pathOr('', ['node', 'url'], data)
    const additions = pathOr(0, ['node', 'additions'], data)
    const deletions = pathOr(0, ['node', 'deletions'], data)
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const mergedAt = pathOr('', ['node', 'mergedAt'], data)

    const allCommentsInfo = formatAllComments(exclude, data)

    const {
        approvals,
        approvers,
    } = formatApprovals(data)

    const prInfo = {
        repo,
        org,
        author,
        url,

        additions,
        deletions,
        prSize: additions + deletions,

        mergedAt,
        age: differenceInDays(new Date(mergedAt), new Date(createdAt)) || 1,

        approvals,
        approvers,

        ...allCommentsInfo
    }

    return prInfo
}

const dateSort = (order) => ({ mergedAt: a }, { mergedAt: b }) => order === 'DESC'
    ? new Date(a).getTime() > new Date(b).getTime()
    : new Date(a).getTime() - new Date(b).getTime()

const formatPullRequests = ({ excludeIds = [], order }, untilDate, results) => {
    const filteredPRs = []
    const pullrequests = compose(
        sort(dateSort('ASC')),
        map(prData(excludeIds)),
        filter(item => {
            const author = pathOr('', ['node','author','login'], item)
            const hasExcludedAuthor = any(y => y === author, excludeIds)
            const shouldFilterIn = filterByUntilDate('mergedAt', order, untilDate)(item)
            const keepItem = shouldFilterIn && !hasExcludedAuthor

            !keepItem && filteredPRs.push(item)
            return keepItem
        }),
        flatten,
        map(pathOr([], ['data', 'result', 'pullRequests', 'edges'])),
    )(results)

    return [pullrequests, filteredPRs]
}


// TODO: is this used?
const formatRepo = (data) => ({
    name: pathOr('', ['data', 'result', 'name'], data),
    org: pathOr('', ['data', 'result', 'owner', 'login'], data),
    pullRequests: formatPullRequests(data),
})

const formatIssue = (data) => {
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const title = pathOr('', ['node', 'title'], data)
    const url = pathOr('', ['node', 'url'], data)
    const labels = pathOr([], ['node', 'labels', 'edges'], data)

    return {
        // TODO: update key
        mergedAt: createdAt,
        url,
        isBug: /bug/i.test(title) || labels.some(x => /bug/i.test(path(['node', 'name'], x))),
    }
}

const formatIssues = compose(
    map(formatIssue),
    flatten,
    map(pathOr([], ['data', 'result', 'issues', 'edges'])),
)

const getReleaseType = (tag) => {
    try {
        const majorV = major(tag)
        const minorV = minor(tag)
        const patchV = patch(tag)
        const prereleaseV = prerelease(tag)

        const releaseType = [
            !prereleaseV && majorV && minorV === 0 && patchV === 0 && 'MAJOR',
            !prereleaseV && minorV && patchV === 0 && 'MINOR',
            'PATCH',
        ].find(Boolean)

        return releaseType
    } catch(error) {
        return 'PATCH'
    }
}

const formatRelease = (data) => {
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const tag = pathOr('', ['node', 'tag', 'name'], data)

    const releaseType = getReleaseType(tag)

    return {
        date: createdAt,
        description: tag,
        releaseType,
    }
}

const formatReleases = compose(
    map(formatRelease),
    flatten,
    map(pathOr([], ['data', 'result', 'releases', 'edges'])),
)
export {
    formatRepo,
    formatPullRequests,
    formatIssues,
    formatReleases,
}
