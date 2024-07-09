import { userQuery } from './queries'
import { mergeDeepRight, prop } from 'ramda'
import api from './api'
import batch from './batch'

const getUsersData = async({ fetchInfo, untilDate, dispatch }: GetUsersData) => {
    try {
        const userIds = fetchInfo.userIds
        const data = userIds
            .map((user: string) => ({
                fetchInfo: {
                    ...fetchInfo,
                    issuesPagination: fetchInfo.issuesPagination[user] || { hasNextPage: true },
                    prPagination: fetchInfo.prPagination[user] || { hasNextPage: true },
                    user,
                },
                queryInfo: userQuery(untilDate),
                dispatch,
            }))
        const allUsersData = await batch(data, api, 1) as any[]

        const paginationInfo:AnyObject = {
            issuesPagination: {},
            prPagination: {},
        }

        const allResults: any[] = []
        allUsersData
            .forEach(({ fetchInfo, results }: {fetchInfo: FetchInfo, results: any[] }) => {
                allResults.push(results)

                const user: string = fetchInfo?.user || ''

                paginationInfo.issuesPagination[user] = prop('issuesPagination', fetchInfo)
                paginationInfo.prPagination[user] = prop('prPagination', fetchInfo)
            })

        const finalFetchInfo = mergeDeepRight(fetchInfo, paginationInfo)

        const usersData = {
            fetchInfo: finalFetchInfo,
            results: allResults.flat(),
            reviewResults: [],
        }

        return usersData
    } catch (error) {
        console.log('-=-=--getUsersData:error', error)
        throw error
    }
}

export default getUsersData
