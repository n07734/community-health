import { path, pathOr } from 'ramda'
import differenceInDays from 'date-fns/difference_in_days'
import {
    major,
    minor,
    patch,
    prerelease,
} from 'semver'

const formatCommenters = items => items
    .reduce((acc, item) => {
        const user = path(['node', 'author', 'login'], item)
        const userCount = (acc[user] || 0) + 1

        return Object.assign(acc, { [user]: userCount })
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

const filterByUser = user => item => path(['node', 'author', 'login'], item) !== user

const formatCodeComments = (data) => {
    const author = pathOr('', ['node', 'author', 'login'], data)
    const allReviews = pathOr([], ['node', 'reviews', 'edges'], data)

    const allCodeComments = allReviews
        .reduce((acc, review) => {
            const comments = pathOr([], ['node', 'comments', 'edges'], review)
                .filter(filterByUser(author))

            acc.push(...comments)

            return acc
        }, [])

    return {
        codeComments: allCodeComments.length,
        codeCommenters: formatCommenters(allCodeComments),
    }
}

const formatGeneralComments = (data) => {
    const author = pathOr('', ['node', 'author', 'login'], data)
    const comments = pathOr([], ['node', 'comments', 'edges'], data)
        .filter(filterByUser(author))

    return {
        generalComments: comments.length,
        generalCommenters: formatCommenters(comments),
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

const prData = (data) => {
    const org = pathOr('', ['node', 'repository', 'owner', 'login'], data)
    const repo = pathOr('', ['node', 'repository', 'name'], data)
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
    } = formatCodeComments(data)

    const {
        generalComments = 0,
        generalCommenters,
    } = formatGeneralComments(data)

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
        age: differenceInDays(mergedAt, createdAt) || 1,

        approvals,
        approvers,

        generalComments,
        generalCommenters,

        codeComments,
        codeCommenters,

        comments: codeComments + generalComments,
        commenters: mergeCommenters(generalCommenters)(codeCommenters),
    }

    return prInfo
}

const formatPullRequests = data =>  pathOr([], ['data', 'repository', 'pullRequests', 'edges'], data)
    .map(prData)

const formatRepo = (data) => ({
    name: pathOr('', ['data', 'repository', 'name'], data),
    org: pathOr('', ['data', 'repository', 'owner', 'login'], data),
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

const formatIssues = data =>
    pathOr([], ['data', 'repository', 'issues', 'edges'], data)
        .map(formatIssue)


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

const formatReleases = data =>
    pathOr([], ['data', 'repository', 'releases', 'edges'], data)
        .map(formatRelease)

export {
    formatRepo,
    formatPullRequests,
    formatIssues,
    formatReleases,
}
