import { ApiArgs, ApiResult, BatchedQueryArgs, GetOrgData } from '../types/Queries'

import { orgQuery,  batchedQuery} from './queries'
import api from './api'
import batch from './batch'
import { RawDataResult } from '../types/RawData'

const getOrgData = async({ fetchInfo, untilDate }:GetOrgData):Promise<ApiResult> => {
    try {
        const orgData = await api({
            fetchInfo,
            queryInfo: orgQuery,
        })

        const orgsRepos = orgData?.results.flat() || []
        const repos = orgsRepos
            .filter((info) => info?.node?.name)
            .map((info) => info?.node?.name)

        const org = fetchInfo.org
        const allRepoQueries = repos
            .map((repo): ApiArgs => ({
                fetchInfo: {
                    ...fetchInfo,
                    issuesPagination: fetchInfo?.issuesPagination[repo] || { hasNextPage: true },
                    prPagination: fetchInfo?.prPagination[repo] || { hasNextPage: true },
                    org,
                    repo,
                    repos,
                },
                queryInfo: batchedQuery(untilDate),
            }))

        const allReposData = await batch(allRepoQueries, api, 1) as {
            fetchInfo: BatchedQueryArgs
            results: RawDataResult[]
        }[]

        const allResults: RawDataResult[][] = []
        allReposData
            .forEach(({ fetchInfo, results = [] }) => {
                allResults.push(results)

                const {
                    repo,
                    issuesPagination,
                    releasesPagination,
                    prPagination,
                } = fetchInfo

                fetchInfo.issuesPagination[repo] = issuesPagination
                fetchInfo.releasesPagination[repo] = releasesPagination
                fetchInfo.prPagination[repo] = prPagination
            })

        const orgReposData: ApiResult = {
            fetchInfo,
            results: allResults.flat(),
            reviewResults: [],
        }

        return orgReposData
    } catch (error) {
        console.log('-=-=--getOrgData:error', error)
        throw error
    }
}

export default getOrgData
