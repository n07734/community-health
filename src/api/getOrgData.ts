import { mergeDeepRight } from 'ramda'
import { orgQuery,  batchedQuery} from './queries'
import api from './api'
import batch from './batch'

const getOrgData = async({ fetchInfo, untilDate, dispatch }:GetUsersData) => {
    try {

        const orgData = await api({
            fetchInfo,
            queryInfo: orgQuery,
            dispatch,
        })

        const orgsRepos = orgData?.results.flat() || []
        const repos = orgsRepos
            .filter((info) => info?.node?.name)
            .map((info) => info?.node?.name)

        const org = fetchInfo.org
        const allRepoQueries = repos
            .map((repo) => ({
                fetchInfo: {
                    ...fetchInfo,
                    issuesPagination: fetchInfo?.issuesPagination[repo] || { hasNextPage: true },
                    prPagination: fetchInfo?.prPagination[repo] || { hasNextPage: true },
                    org,
                    repo,
                },
                queryInfo: batchedQuery(untilDate),
                dispatch,
            }))

        const allReposData = await batch(allRepoQueries, api, 1) as any[]

        const paginationInfo:AnyObject = {
            issuesPagination: {},
            releasesPagination: {},
            prPagination: {},
        }

        const allResults: any[] = []
        allReposData
            .forEach(({ fetchInfo, results }:{fetchInfo: FetchInfo, results: any[] }) => {
                allResults.push(results)

                const {
                    repo,
                    issuesPagination,
                    releasesPagination,
                    prPagination,
                } = fetchInfo

                paginationInfo.issuesPagination[repo] = issuesPagination
                paginationInfo.releasesPagination[repo] = releasesPagination
                paginationInfo.prPagination[repo] = prPagination
            })

        const finalFetchInfo = mergeDeepRight(fetchInfo, paginationInfo)

        const orgReposData = {
            fetchInfo: finalFetchInfo,
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
