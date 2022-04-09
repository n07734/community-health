import {
    compose,
    map,
    none,
    flatten,
    filter,
    path,
    pathOr,
} from 'ramda'
import differenceInDays from 'date-fns/differenceInDays'
import {
    major,
    minor,
    patch,
    prerelease,
} from 'semver'
import Sentiment from 'sentiment'

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

const mergeCommenters = (left = {}) => (right = {}) => {
    const leftEntries = Object.entries(left)
    const rightEntries = Object.entries(right)

    const mergedObject = [
        ...leftEntries,
        ...rightEntries,
    ]
        .reduce((acc, [user, value]) => {
            const newTotal = (acc[user] || 0) + value

            return Object.assign(acc, { [user]: newTotal })
        }, {})

    return mergedObject
}

const formatRepoInfo = ([data]) => ({
    repo: pathOr('', ['data', 'result', 'name'], data),
    org: pathOr('', ['data', 'result', 'owner', 'org'], data),
    description: pathOr('', ['data', 'result', 'description'], data),
})

const filterByUsers = users => item => !users.includes(path(['node', 'author', 'login'], item))

const getAllCodeComments = (exclude, data) => {
    const author = pathOr('', ['node', 'author', 'login'], data)
    const allReviews = pathOr([], ['node', 'reviews', 'edges'], data)

    const allCodeComments = allReviews
        .reduce((acc, review) => {
            const comments = pathOr([], ['node', 'comments', 'edges'], review)
                .filter(filterByUsers([...exclude, author]))

            acc.push(...comments)

            return acc
        }, [])

    return allCodeComments
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
        sentimentScore: sentimental.reduce((acc, { score = 0 } = {}) => score + acc,0),
        sentiments: formatSentimentsCommenters(sentimental),
    }
}

const formatCodeComments = (exclude, data) => {
    const allCodeComments = getAllCodeComments(exclude, data)

    const {
        sentimentScore = 0,
        sentiments = {},
    } = formatSentiments(allCodeComments)

    return {
        codeComments: allCodeComments.length,
        codeCommenters: formatCommenters(allCodeComments),
        codeCommentSentimentScore: sentimentScore,
        codeCommentSentiments: sentiments,
    }
}

const formatGeneralComments = (exclude, data) => {
    const author = pathOr('', ['node', 'author', 'login'], data)
    const comments = pathOr([], ['node', 'comments', 'edges'], data)
        .filter(filterByUsers([...exclude, author]))

    const {
        sentimentScore = 0,
        sentiments = {},
    } = formatSentiments(comments)

    return {
        generalComments: comments.length,
        generalCommenters: formatCommenters(comments),
        generalCommentSentimentScore: sentimentScore,
        generalCommentSentiments: sentiments,
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
    const org = pathOr('', ['node', 'result', 'owner', 'login'], data)
    const repo = pathOr('', ['node', 'result', 'name'], data)
    const author = pathOr('', ['node', 'author', 'login'], data)
    const url = pathOr('', ['node', 'url'], data)
    const additions = pathOr(0, ['node', 'additions'], data)
    const deletions = pathOr(0, ['node', 'deletions'], data)
    const changedFiles = pathOr(0, ['node', 'changedFiles'], data)
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const mergedAt = pathOr('', ['node', 'mergedAt'], data)

    const {
        codeComments = 0,
        codeCommenters,
        codeCommentSentimentScore,
        codeCommentSentiments,
    } = formatCodeComments(exclude, data)

    const {
        generalComments = 0,
        generalCommenters,
        generalCommentSentimentScore,
        generalCommentSentiments,
    } = formatGeneralComments(exclude, data)

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
        changedFiles,
        prSize: additions + deletions,

        createdAt,
        mergedAt,
        age: differenceInDays(new Date(mergedAt), new Date(createdAt)) || 1,

        approvals,
        approvers,

        generalComments,
        generalCommenters,
        generalCommentSentimentScore,
        generalCommentSentiments,

        codeComments,
        codeCommenters,
        codeCommentSentimentScore,
        codeCommentSentiments,

        comments: codeComments + generalComments,
        commenters: mergeCommenters(generalCommenters)(codeCommenters),
        commenterSentiments: mergeCommenters(generalCommentSentiments)(codeCommentSentiments),
        commentsSentimentScore: generalCommentSentimentScore + codeCommentSentimentScore,
    }

    return prInfo
}

const formatPullRequests = (exclude = [], results) => compose(
    filter(x => none(y => y === x.author, exclude)),
    map(prData(exclude)),
    flatten,
    map(pathOr([], ['data', 'result', 'pullRequests', 'edges'])),
)(results)


// TODO: is this used?
const formatRepo = (data) => ({
    name: pathOr('', ['data', 'result', 'name'], data),
    org: pathOr('', ['data', 'result', 'owner', 'login'], data),
    pullRequests: formatPullRequests(data),
})

const formatIssue = (data) => {
    const createdAt = pathOr('', ['node', 'createdAt'], data)
    const closedAt = pathOr('', ['node', 'closedAt'], data)
    const title = pathOr('', ['node', 'title'], data)
    const labels = pathOr([], ['node', 'labels', 'edges'], data)

    return {
        createdAt,
        mergedAt: createdAt,
        closedAt,
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
    formatRepoInfo,
    formatPullRequests,
    formatIssues,
    formatReleases,
}
