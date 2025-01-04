import { GetUserData, ApiArgs, ApiResult } from '../types/Queries'
import { FetchInfoForUser } from '@/types/State'

import { userQuery, reviewsByUserQuery } from './queries'
import api from './api'

const getUserData = async({ fetchInfo, untilDate }:GetUserData):Promise<ApiResult> => {
    try {
        const [user] = fetchInfo.userIds || []

        const updatedFetchInfo: FetchInfoForUser = {
            ...fetchInfo,
            issuesPagination: fetchInfo?.issuesPagination[user] || { hasNextPage: true },
            prPagination: fetchInfo?.prPagination[user] || { hasNextPage: true },
            user,
        }
        const userData: ApiArgs = {
            fetchInfo: updatedFetchInfo,
            queryInfo: userQuery(untilDate),
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
        }
        const allUserReviewData = await api(userReviewData)
        const allReviewResults = allUserReviewData.results

        const paginationInfo = {
            issuesPagination: {
                [user]: allUserData.fetchInfo?.issuesPagination,
            },
            prPagination: {
                [user]: allUserData.fetchInfo?.prPagination,
            },
            usersReviewsPagination: {
                [user]: allUserReviewData.fetchInfo?.usersReviewsPagination || { hasNextPage: true },
            },
        }

        const finalFetchInfo = {
            ...fetchInfo,
            ...paginationInfo,
        }

        const usersData: ApiResult = {
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
