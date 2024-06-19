import { propOr } from 'ramda'
import { diff, lt } from 'semver'

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

const formatReleaseData = (results = []) => {
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
                    'major': 'MAJOR',
                })[diffType] || 'PATCH'

            } catch (error) {
                // eslint-disable-next-line no-unused-vars
                releaseType = 'PATCH'
            }

            return {
                ...release,
                releaseType: release.releaseType || 'MAJOR',
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

const formatMarkers = ({ usersInfo = {}, events = [] } = {}) => {
    const teamMarkers = []
    Object.values(usersInfo)
        .forEach(({
            name,
            userId,
            dates = [],
        } = {}) => {
            dates
                .forEach((dateInfo = {}) => {
                    const {
                        startDate,
                        endDate,
                    } = dateInfo
                    if (startDate) {
                        teamMarkers.push({
                            date: startDate,
                            description: name || userId,
                            releaseType: 'MINOR',
                        })
                    }
                    if (endDate) {
                        teamMarkers.push({
                            date: endDate,
                            description: name || userId,
                            releaseType: 'PATCH',
                        })
                    }
                })
        })

    const eventMarkers = events
        .map(({date, name} = {}) => ({
            date,
            description: name,
            releaseType: 'MAJOR',
        }))
    const dateSort = ({ date: a }, { date: b }) => new Date(a).getTime() - new Date(b).getTime()
    const sortedMarkers = [...teamMarkers, ...eventMarkers].sort(dateSort)

    return sortedMarkers
}

export {
    formatMarkers,
    formatReleaseData,
}
