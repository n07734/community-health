import { userQuery, reviewsByUserQuery } from './queries'
import { mergeDeepRight, prop } from 'ramda'
import api from './api'

const getUserData = async({ fetchInfo, untilDate, dispatch }) => {
    try {
        const [user] = fetchInfo.userIds
        const userData = {
            fetchInfo: {
                ...fetchInfo,
                issuesPagination: fetchInfo.issuesPagination[user] || { hasNextPage: true },
                prPagination: fetchInfo.prPagination[user] || { hasNextPage: true },
                user,
            },
            queryInfo: userQuery(untilDate),
            dispatch,
        }

        const allUserData = await api(userData)
        const allResults = allUserData.results

        const userReviewData = {
            fetchInfo: {
                ...fetchInfo,
                usersReviewsPagination: fetchInfo.usersReviewsPagination?.[user] || { hasNextPage: true },
                user,
            },
            queryInfo: reviewsByUserQuery(untilDate),
            dispatch,
        }
        const allUserReviewData = await api(userReviewData)
        const allReviewResults = allUserReviewData.results

        const paginationInfo = {
            issuesPagination: prop('issuesPagination', allUserData.fetchInfo),
            prPagination: prop('prPagination', allUserData.fetchInfo),
            usersReviewsPagination: prop('usersReviewsPagination', allUserReviewData.fetchInfo),
        }

        const finalFetchInfo = mergeDeepRight(fetchInfo, paginationInfo)

        const usersData = {
            fetchInfo: finalFetchInfo,
            results: allResults.flat(),
            reviewResults: allReviewResults.flat(),
        }

        return usersData
    } catch (error) {
        console.log('-=-=--getUserData:error', error)
        throw error
    }
}

export default getUserData
