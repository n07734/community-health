import _get from 'lodash/get'
import differenceInDays from 'date-fns/difference_in_days'
import {
    major,
    minor,
    patch,
    prerelease,
} from 'semver'

const formatCommenters = items => items
    .reduce((acc, item) => {
        const user = _get(item, 'node.author.login')
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

const filterByUser = user => item => _get(item, 'node.author.login') !== user

const formatCodeComments = (data) => {
    const author = _get(data, 'node.author.login', '')
    const allReviews = _get(data, 'node.reviews.edges', [])

    const allCodeComments = allReviews
        .reduce((acc, review) => {
            const comments = _get(review, 'node.comments.edges', [])
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
    const author = _get(data, 'node.author.login', '')
    const comments = _get(data, 'node.comments.edges', [])
        .filter(filterByUser(author))

    return {
        generalComments: comments.length,
        generalCommenters: formatCommenters(comments),
    }
}

const formatApprovals = (data) => {
    const reviews = _get(data, 'node.reviews.edges', [])
    const ghApprovals = reviews
        .filter(x => _get(x, 'node.state') === 'APPROVED')

    const ghApprovers = formatCommenters(ghApprovals)

    return {
        approvals: ghApprovals.length,
        approvers: ghApprovers,
    }
}

const prData = (data) => {
    const {
        repository: {
            name: repo = '',
            owner: {
                login: org = '',
            } = {},
        } = {},
        author: {
            login: author = '',
        } = {},
        url = '',

        additions = 0,
        deletions = 0,
        changedFiles = 0,

        createdAt = '',
        mergedAt = '',
    } = _get(data, 'node', {})

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

const formatPullRequests = data =>  _get(data, 'data.repository.pullRequests.edges', [])
    .map(prData)

const formatRepo = (data) => ({
    name: _get(data, 'data.repository.name', ''),
    org: _get(data, 'data.repository.owner.login', ''),
    pullRequests: formatPullRequests(data),
})

const formatIssue = (data) => {
    const createdAt = _get(data, 'node.createdAt', '')
    const closedAt = _get(data, 'node.closedAt', '')
    const title = _get(data, 'node.title', '')
    const labels = _get(data, 'node.labels.edges', [])

    return {
        createdAt,
        mergedAt: createdAt,
        closedAt,
        isBug: /bug/i.test(title) || labels.some(x => /bug/i.test(_get(x, 'node.name'))),
    }
}

const formatIssues = data =>
    _get(data, 'data.repository.issues.edges', [])
        .map(formatIssue)


const getReleaseType = (tag) => {
    try {
        const majorV = major(tag)
        const minorV = minor(tag)
        const patchV = patch(tag)
        const prereleaseV = prerelease(tag)
    
        console.log('majorV, minorV, patchV', majorV, minorV, patchV, prereleaseV)

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
    const createdAt = _get(data, 'node.createdAt', '')
    const tag = _get(data, 'node.tag.name', '')

    const releaseType = getReleaseType(tag)

    return {
        date: createdAt,
        description: tag,
        releaseType,
    }
}

const formatReleases = data =>
    _get(data, 'data.repository.releases.edges', [])
        .map(formatRelease)

export {
    formatRepo,
    formatPullRequests,
    formatIssues,
    formatReleases,
}
