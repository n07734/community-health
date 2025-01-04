import {
    ApiArgs,
    ApiResult,
    GetTeamData,
    UsersQueryArgs,
} from '@/types/Queries'
import { RawDataResult } from '@/types/RawData'

import { userQuery } from './queries'
import api from './api'
import batch from './batch'

const getUsersData = async ({ fetchInfo, untilDate }: GetTeamData): Promise<ApiResult> => {
    try {
        const userIds = fetchInfo.userIds
        const data = userIds
            .map((user: string): ApiArgs => ({
                fetchInfo: {
                    ...fetchInfo,
                    issuesPagination: fetchInfo.issuesPagination[user] || { hasNextPage: true },
                    prPagination: fetchInfo.prPagination[user] || { hasNextPage: true },
                    user,
                },
                queryInfo: userQuery(untilDate),
            }))
        const allUsersData = await batch(data, api, 1) as {
            fetchInfo: UsersQueryArgs
            results: RawDataResult[]
        }[]

        const allResults: RawDataResult[][] = []
        allUsersData
            .forEach(({ fetchInfo, results }) => {
                allResults.push(results)

                const user: string = fetchInfo?.user || ''

                fetchInfo.issuesPagination[user] = fetchInfo?.issuesPagination
                fetchInfo.prPagination[user] = fetchInfo?.prPagination
            })

        const usersData: ApiResult = {
            fetchInfo,
            results: allResults.flat(),
        }

        return usersData
    } catch (error) {
        console.log('-=-=--getUsersData:error', error)
        throw error
    }
}

export default getUsersData
