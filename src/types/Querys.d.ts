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
    reviewResults: any[]
}

export type SortDirection = 'ASC' | 'DESC'

type QueryInfoToDo = {
    (fetchInfo: FetchInfo): {
        query: string
        resultInfo: (result: ApiResponse) => {
            hasNextPage: boolean
            nextPageInfo?: FetchInfo
        }
        fillerType: FilterType
    };
}

type QueryInfo = any

type Dispatch = (action: { type: string, payload: any }) => void

export type ApiInfo = { fetchInfo: FetchInfo, queryInfo: QueryInfo, dispatch: Dispatch }

type ApiError = {
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


type Paginations = {
    usersReviewsPagination?: OldNew
    issuesPagination?: OldNew
    prPagination?: OldNew
    releasesPagination?: OldNew
    commitCommentsPagination?: OldNew
    issueCommentsPagination?: OldNew
}

type QueryDefault = Paginations & {
    amountOfData: AmountOfData
    sortDirection?: SortDirection
}

export type UserQueryArgs = QueryDefault & {
    user: string
}

export type BatchedQueryArgs = QueryDefault & {
    org: string
    repo: string
}

type FetchInfoToDo = BatchedQueryArgs & {
    name?: string
    enterpriseAPI?: string
    token: string
}

export type FetchInfo = any

export type UntilDate = string | undefined

export type NodeCursor = {
    cursor: Cursor
    nodeId: string
}

type FilterType = '' | 'pullRequests' | 'pullRequestReviewComments' | 'batchedQuery' | 'comments' | 'pullRequestReviewComments'

export type MakeQuery = (queryInfo: any) => { query: any, resultInfo: any, fillerType: FilterType }

type GetUsersData = {
    fetchInfo: FetchInfo
    untilDate: UntilDate
    dispatch: any
}