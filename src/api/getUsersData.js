import { userQuery as queryInfo } from './queries'
import { prop } from 'ramda'
import api from './api'
import batch from './batch'

const getUsersData = async(fetchInfo, dispatch) => {
    try {
        const userIds = fetchInfo.userIds
        const data = userIds
            .map((user) => ({
                fetchInfo: {
                    ...fetchInfo,
                    issuesPagination: fetchInfo.issuesPagination[user] || { hasNextPage: true },
                    prPagination: fetchInfo.prPagination[user] || { hasNextPage: true },
                    user,
                },
                queryInfo,
                dispatch,
            }))

        const allUsersData = await batch(data, api, 1)

        const finalFetchInfo = {
            ...fetchInfo,
        }
        const allResults = []
        allUsersData
            .forEach(({ fetchInfo, results }) => {
                allResults.push(results)

                const user = prop('user', fetchInfo)
                finalFetchInfo.issuesPagination[user] = prop('issuesPagination', fetchInfo)
                finalFetchInfo.prPagination[user] = prop('prPagination', fetchInfo)
            })

        const usersData = {
            fetchInfo: finalFetchInfo,
            results: allResults.flat(),
        }

        console.log('-=-=--usersData', usersData)

        return usersData
    } catch (error) {
        console.log('-=-=--getUsersData:error', error)
        throw error
    }
}

export default getUsersData
