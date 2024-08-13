import {Review, Comment} from './Querys'

export type RawDate = 'createdAt' | 'closedAt' | 'date'


export type RawDataItem ={
    node: {
        [key in RawDate]: string
    } & {
        id: string
        name: string
        title: string
        url: string
        tag: {
            name: string
        }
        labels: {
            edges: {
                node: {
                    name: string
                }
            }[]
        }
    }
}

type RawResultTypes =  {
    issues: {
        totalCount: number
        edges:RawDataItem[]
    }
    releases: {
        totalCount: number
        edges:RawDataItem[]
    }
    pullRequests: {
        totalCount: number
        edges: RawPullRequest[]
    }
}
export type RawDataType = keyof RawResultTypes


export type RawDataResult ={
    data: {
        result: RawResultTypes
    }
}

export type RawDataPRSearchResult ={
    data: {
        result: {
            totalCount: number
            edges: RawPullRequest[]
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
        author: {
            login: string
            url: string
        }
        mergedAt: string
        createdAt: string
        reviews: {
            edges: Review[]
            pageInfo: Cursors
        }
        comments: {
            edges: Comment[]
            pageInfo: Cursors
        }
        commits: {
            edges: {
                node: {
                    commit: {
                        committedDate: string
                    }
                }
            }[]
        }
    }
}

export type DateKeys = 'mergedAt' | 'createdAt' | 'date'
