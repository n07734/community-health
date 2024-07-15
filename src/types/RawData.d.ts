import { id } from "date-fns/locale"

export type RawDate = 'createdAt' | 'closedAt' | 'date'
export type RawDataItem ={
    node: {
        [key in RawDate]: string
    } & {
        id: string
        name: string
    }
}
export type RawDataType = 'pullRequests' | 'issues' | 'releases'

export type RawDataResult ={
    data: {
        result: {
            [key in RawDataType]: {
                totalCount: number
                edges:RawDataItem[]
            }
        }
    }
}

export type RawEventInfo = {
    date: string
    description: string
}

export type Cursors = {
    endCursor: string
    startCursor?: string
    hasNextPage: boolean
}

export type RawPageInfo = {
    pageInfo: Cursors
}
export type RawPullRequest = {
    node: {
        id: string
        mergedAt: string
        reviews: {
            edges: []
            pageInfo: Cursors
        }
        comments: {
            edges: []
            pageInfo: Cursors
        }
    }
}

export type DateKeys = 'mergedAt' | 'createdAt' | 'date'

// TODO: Flesh out this type
export type RawData = {
    [key: string]: any
}

// TODO: Flesh out this type
export type RawItem = {
    [key: string]: any
}