/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FetchInfo,
    FetchInfoForOrg,
    FetchInfoForTeam,
    FetchInfoForUser,
} from './State'

export type AmountOfData = number | 'all'
export type ApiResults = any[]

export type ApiResponse = {
    status: number
    message?: string
    [key: string]: any
}

export type ApiResult = {
    errorMessage?: ApiError
    fetchInfo: FetchInfo
    results: ApiResults
    reviewResults?: ApiResults
}

export type SortDirection = 'ASC' | 'DESC'

export type QueryInfo = any

export type ApiArgs = { fetchInfo: FetchInfo, queryInfo: QueryInfo }

export type ApiError = {
    level: string
    message: string
}

export type OldNew = {
    oldest?: string
    newest?: string
    hasNextPageForDate?: boolean
    hasNextPage?: boolean
}

export type Cursor = undefined | string

export type RawDataTypeKey = 'pullRequests' | 'issues' | 'releases'
export type RawDataCommentTypeKey = 'usersReviews' | 'commitComments' | 'issueComments'

export type RawPageInfo = {
    startCursor: string
    endCursor: string
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export type Comment = {
    node: {
        author: {
            login: string
            url: string
        }
        publishedAt: string
        body: string
    }
}
export type CommentsQueryResult = {
    data: {
        node: {
            id: string
            comments: {
                pageInfo: RawPageInfo
                edges: Comment[]
            }
        }
    }
}

export type Review = {
    node: {
        author: {
            login: string
            url: string
        }
        id: string
        state: string
        comments: {
            pageInfo: RawPageInfo
            edges: Comment[]
        }
    }
}

export type ReviewsQueryResult = {
    data: {
        node: {
            id: string
            reviews: {
                pageInfo: RawPageInfo
                edges: Review[]
            }
        }
    }
}

export type OrgQueryResult = {
    data: {
        organization: {
            repositories: {
                pageInfo: RawPageInfo
                edges: {
                    node: {
                        name: string
                    }[]
                }
            }
        }
    }
}

export type TeamIDsQueryResult = {
    data: {
        organization: {
            team: {
                members: {
                    pageInfo: RawPageInfo
                    edges: {
                        node: {
                            login: string
                        }[]
                    }
                }
            }
        }
    }
}

export type Paginations = {
    usersReviewsPagination?: OldNew
    issuesPagination?: OldNew
    prPagination?: OldNew
    releasesPagination?: OldNew
    commitCommentsPagination?: OldNew
    issueCommentsPagination?: OldNew
}

type QueryDefault = {
    amountOfData: AmountOfData
    sortDirection?: SortDirection
}

export type UserQueryArgs = QueryDefault & {
    usersReviewsPagination?: OldNew
    prPagination?: OldNew
    issuesPagination?: OldNew
    commitCommentsPagination?: OldNew
    issueCommentsPagination?: OldNew
    user: string
}

type BatchedPaginations = {
    issuesPagination: {
        [key:string]: OldNew } & {
        hasNextPage?: boolean
    }
    prPagination: {
        [key:string]: OldNew } & {
        hasNextPage?: boolean
    }
    releasesPagination: {
        [key:string]: OldNew } & {
        hasNextPage?: boolean
    }
}

export type BatchedQueryArgs = QueryDefault & BatchedPaginations & {
    org: string
    repo: string
}

export type UsersQueryArgs = QueryDefault & BatchedPaginations & {
    user: string
}

export type UsersPaginations = {
    issuesPagination: {
        [key:string]: OldNew
    }
    prPagination: {
        [key:string]: OldNew
    }
}

export type ApiFetchInfo = any

export type UntilDate = string | undefined

export type NodeCursor = {
    cursor: Cursor
    nodeId: string
}

export type FilterType = '' | 'pullRequests' | 'pullRequestReviewComments' | 'batchedQuery' | 'comments' | 'pullRequestReviewComments'

export type MakeQuery = (queryInfo: any) => { query: any, resultInfo: any, fillerType: FilterType }

export type GetUserData = {
    fetchInfo: FetchInfoForUser
    untilDate: UntilDate
}

export type GetTeamData = {
    fetchInfo: FetchInfoForTeam
    untilDate: UntilDate
}

export type GetOrgData = {
    fetchInfo: FetchInfoForOrg
    untilDate: UntilDate
}