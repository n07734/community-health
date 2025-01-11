import { diff, lt } from 'semver'
import { SavedEvent, UserDate, UserInfo, UsersInfo } from '../types/State'
import { EventInfo, ReleaseType } from '../types/FormattedData'
import { RawEventInfo } from '../types/RawData'

const datePropSort = (aObj:Record<string, string>, bObj:Record<string, string>) => {
    const a = aObj?.date || ''
    const b = bObj?.date || ''
    return new Date(a).getTime() - new Date(b).getTime()
}

const getTag = (arg:Record<string, string>): string => {
    const value = arg?.description || ''
    return value as string
}

const semVerSort = (a:Record<string, string>, b:Record<string, string>) => {
    let sortResult
    try {
        sortResult = lt(getTag(a), getTag(b))
            ? -1
            : 1
    } catch (_error) {
        sortResult = 0
    }

    return sortResult
}

const formatReleaseData = (results: RawEventInfo[] = []) => {
    const semVerSortedResults = results
        .filter(x => /^v?\d+\.\d+\.\d+$/.test(getTag(x)))
        .sort(semVerSort)

    const formattedReleases = semVerSortedResults
        .map((release, i) => {
            const currentTag = getTag(release)
            let releaseType = ''

            try {
                const prevTag = i > 0
                    ? getTag(semVerSortedResults[i - 1])
                    : 'v0.0.0'

                const diffType = diff(prevTag, currentTag) || 'EMPTY'

                releaseType = ({
                    'minor': 'MINOR',
                    'major': 'MAJOR',
                    'patch': 'PATCH',
                    'premajor': 'PATCH',
                    'preminor': 'PATCH',
                    'prepatch': 'PATCH',
                    'prerelease': 'PATCH',
                    'EMPTY': 'PATCH',
                })[diffType] || 'PATCH'

            } catch (_error) {
                releaseType = 'PATCH'
            }

            const date = /T/.test(release.date)
                ? release.date.split('T')[0]
                : release.date

            const item: EventInfo = {
                ...release,
                date,
                releaseType: releaseType as ReleaseType || 'MAJOR',
            }
            return item
        })

    const finalFilter = formattedReleases.length > 70
        ? (release:EventInfo) => release.releaseType !== 'PATCH'
        : () => true

    const dateSortedReleases = formattedReleases
        .filter(finalFilter)
        .sort((a:Record<string, string>, b:Record<string, string>) => datePropSort(a,b))

    return dateSortedReleases
}


const formatMarkers = ({
    usersInfo = {},
    releases = [],
    events = [],
}: {
    usersInfo?: UsersInfo
    releases?: EventInfo[]
    events: SavedEvent[]
}) => {
    const teamMarkers: EventInfo[] = []
    Object.values(usersInfo)
        .forEach(({
            name = '',
            userId = '',
            dates = [],
        }: UserInfo) => {
            dates
                .forEach((dateInfo:UserDate) => {
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
        .map(({date, name}:Record<string, string> = {}):EventInfo => ({
            date,
            description: name,
            releaseType: 'EVENT',
        }))
    const dateSort = (aObj:Record<string, string>, bObj:Record<string, string>) => {
        const a = aObj?.date || ''
        const b = bObj?.date || ''
        return new Date(a).getTime() - new Date(b).getTime()
    }
    const sortedMarkers = [...teamMarkers, ...eventMarkers, ...releases].sort(dateSort)

    return sortedMarkers
}

export {
    formatMarkers,
    formatReleaseData,
}
