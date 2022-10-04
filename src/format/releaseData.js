const { propOr } = require('ramda')
const { diff, lt } = require('semver')

const datePropSort = (a, b) => {
    const getDate = propOr('', 'date')
    return new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime()
}

const getTag = propOr('', 'description')

const semVerSort = (a, b) => {
    let sortResult
    try {
        sortResult = lt(getTag(a), getTag(b))
            ? -1
            : 1
    } catch (error) {
        sortResult = 0
    }

    return sortResult
}

const releaseData = (results = []) => {
    const semVerSortedResults = results
        .filter(x => /^v\d+\.\d+\.\d+$/.test(getTag(x)))
        .sort(semVerSort)

    const formattedReleases = semVerSortedResults
        .map((release = {}, i) => {
            const currentTag = getTag(release)
            let releaseType = ''

            try {
                const prevTag = i > 0
                    ? getTag(semVerSortedResults[i - 1])
                    : 'v0.0.0'

                const diffType = diff(prevTag, currentTag) || ''

                releaseType = ({
                    'minor': 'MINOR',
                    'major': 'MAJOR'
                })[diffType] || 'PATCH'

            } catch (error) {
                releaseType = 'PATCH'
            }

            return {
                ...release,
                releaseType,
            }
        })

    const finalFilter = formattedReleases.length > 70
        ? (x = {}) => x.releaseType !== 'PATCH'
        : () => true

    const dateSortedReleases = formattedReleases
        .filter(finalFilter)
        .sort(datePropSort)

    return dateSortedReleases
}

export default releaseData