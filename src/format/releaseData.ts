import { diff, lt } from 'semver'
import { UserDate, UserInfo, UsersInfo } from '../types/State'
import { ObjStrings } from '../types/Components'
import { EventInfo } from '../types/FormattedData'

const datePropSort = (aObj: ObjStrings, bObj: ObjStrings) => {
    const a = aObj?.date || ''
    const b = bObj?.date || ''
    return new Date(a).getTime() - new Date(b).getTime()
}

const getTag = (arg: ObjStrings): string => {
    const value = arg?.description || ''
    return value as string
}

const semVerSort = (a: ObjStrings, b: ObjStrings) => {
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

type ReleaseResult = {
    description: string
    releaseType: string
}
const formatReleaseData = (results: ReleaseResult[] = []) => {
    const semVerSortedResults = results
        .filter(x => /^v\d+\.\d+\.\d+$/.test(getTag(x)))
        .sort(semVerSort)

    const formattedReleases = semVerSortedResults
        .map((release:ReleaseResult, i) => {
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

            } catch (error) {
                // eslint-disable-next-line no-unused-vars
                releaseType = 'PATCH'
            }

            return {
                ...release,
                releaseType: releaseType || 'MAJOR',
            }
        })

    const finalFilter = formattedReleases.length > 70
        ? (release: any = {}) => release.releaseType !== 'PATCH'
        : () => true

    const dateSortedReleases = formattedReleases
        .filter(finalFilter)
        .sort((a:any,b:any) => datePropSort(a,b))

    return dateSortedReleases
}


const formatMarkers = ({
    usersInfo = {},
    events = []
}: {
    usersInfo?: UsersInfo
    events: EventInfo[]
}) => {
    const teamMarkers: any[] = []
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
        .map(({date, name}: ObjStrings = {}):EventInfo => ({
            date,
            description: name,
            releaseType: 'MAJOR',
        }))
    const dateSort = (aObj: ObjStrings, bObj: ObjStrings) => {
        const a = aObj?.date || ''
        const b = bObj?.date || ''
        return new Date(a).getTime() - new Date(b).getTime()
    }
    const sortedMarkers = [...teamMarkers, ...eventMarkers].sort(dateSort)

    return sortedMarkers
}

export {
    formatMarkers,
    formatReleaseData,
}
