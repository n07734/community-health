import { userQuery as queryInfo } from './queries'
import { prop, pick } from 'ramda'
import api from './api'
import batch from './batch'

const getUsersData = async(fetchInfo, dispatch) => {
    try {
        const userIds = fetchInfo.userIds
        const data = userIds
            .map((user) => ({
                fetchInfo: {
                    ...fetchInfo,
                    user,
                },
                queryInfo,
                dispatch,
            }))

        const allUsersData = await batch(data, api, 3)

        const finalFetchInfo = {
            ...fetchInfo,
            users: {},
        }
        const allResults = []
        allUsersData
            .forEach(({ fetchInfo, results }) => {
                const user = prop('user', fetchInfo)
                finalFetchInfo.users[user] = pick(['issuesPagination', 'prPagination', 'user'], fetchInfo)
                allResults.push(results)
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
