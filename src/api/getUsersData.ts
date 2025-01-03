import mergeDeepRight from 'ramda/es/mergeDeepRight'
import prop from 'ramda/es/prop'
import { ApiInfo, GetUsersData, UsersPaginations, UsersQueryArgs } from '../types/Queries'
import { RawDataResult } from '../types/RawData'

import { userQuery } from './queries'
import api from './api'
import batch from './batch'

const getUsersData = async({ fetchInfo, untilDate, dispatch }: GetUsersData) => {
    try {
        const userIds = fetchInfo.userIds
        const data:ApiInfo[] = userIds
            .map((user: string)  => ({
                fetchInfo: {
                    ...fetchInfo,
                    issuesPagination: fetchInfo.issuesPagination[user] || { hasNextPage: true },
                    prPagination: fetchInfo.prPagination[user] || { hasNextPage: true },
                    user,
                },
                queryInfo: userQuery(untilDate),
                dispatch,
            }))
        const allUsersData = await batch(data, api, 1) as {
            fetchInfo: UsersQueryArgs
            results: RawDataResult[]
        }[]

        const paginationInfo:UsersPaginations = {
            issuesPagination: {},
            prPagination: {},
        }

        const allResults: RawDataResult[][] = []
        allUsersData
            .forEach(({ fetchInfo, results }) => {
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
