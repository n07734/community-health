

import { PullRequest } from './FormattedData'
import { AllowedColors } from './Components'
import { KeysOfValue, UserData } from './State'

type LineDataKey =
    | 'commentSentimentScore'
    | 'commentAuthorSentimentScore'
    | 'commentSentimentTotalScore'
    | 'prSize'
    | 'age'
    | 'comments'
    | 'codeComments'
    | 'generalComments'
    | 'approvals'
    | 'additions'
    | 'deletions'
    | 'author'
    | 'cycleTime'

type IssuesDataKey =
    | 'isBug'
    | 'isFeature'

type CustomDataKey =
    | 'growth'
    | 'value'

export type CustomLineDataKey = LineDataKey | CustomDataKey | IssuesDataKey

export type LineData = IssueIssue | PullRequest

export type LineDataKeys = keyof BugIssue | keyof IssueIssue | keyof PullRequest | keyof AuthorItem | keyof UserData

type LineInfoBase = {
    label: string
    color: AllowedColors | string
    filterForKey?: boolean
    lineStyles?: Record<string, number | string>
    yMax?: number
}

export type LineInfoPR = LineInfoBase & {
    data: PullRequest[]
    dataKey: keyof PullRequest
    groupMath?: GroupMathForPRs
}

export type LineInfoIssue = LineInfoBase & {
    data: IssueIssue[]
    dataKey: keyof IssueIssue
    groupMath?: GroupMathForIssues
}

export type LineInfoAuthor = LineInfoBase & {
    data: AuthorItem[]
    dataKey: 'value'
    groupMath: 'count'
}

export type LineInfo = LineInfoPR | LineInfoIssue | LineInfoAuthor

export type Lines = {
    lines: LineInfo[]
    xAxis?: 'left' | 'right'
}

export type GraphIssue = BugIssue | IssueIssue

export type BugIssue = {
    bug: number;
    mergedAt: string;
}

export type IssueIssue = {
    issue?: number;
    bug?: number;
    mergedAt: string;
}

export type AuthorItem = {
    value: number;
    mergedAt: string;
}

export type LineForGraph = {
    id: string
    color: AllowedColors | string
    data: LinePlot[]
}

export type LinePlot = {
    x: string
    y: number
}

export type GroupMathForPRs =
    | 'sum'
    | 'average'
    | 'count'
    | 'median'
    | 'teamDistribution'
    | 'trimmedAverage'
    | 'percentWith'
    | 'growth'
    | 'averagePerDev'

export type GroupMathForIssues =
    | 'sum'
    | 'average'
    | 'count'
    | 'median'
    | 'percentWith'

export type GroupMath = GroupMathForPRs | GroupMathForIssues

export type GraphLine = {
    label: string,
    color: AllowedColors,
    dataKey: CustomLineDataKey,
    groupMath: GroupMath,
}

export type Graph = {
    graphId: number,
    left: GraphLine[],
    right: GraphLine[],
}

export type GraphOptions = {
    label: string,
    dataKey: CustomLineDataKey,
    groupMaths: GroupMath[],
}

export type GraphFormInfo = {
    label: string,
    dataKey: CustomLineDataKey,
    color: AllowedColors,
    lineSide: 'left' | 'right',
    groupMath: GroupMath,
}

export type ColumnKeys =
    | 'comments'
    | 'codeComments'
    | 'generalComments'
    | 'approvals'
    | 'prSize'
    | 'additions'
    | 'deletions'
    | 'age'
    | 'mergedAt'
    | 'commentSentimentScore'
    | 'commentAuthorSentimentScore'
    | 'commentSentimentTotalScore'
    | 'commentsGiven'
    | 'url'
    | 'author'
    | 'growth'
    | 'repo'
    | 'isBug'
    | 'id'

export type TableData = {
    [key in ColumnKeys]?: string | number | boolean
}

export type BarData = {
    [key: string]: number | string
}

export type BarInfo = {
    dataKey: KeysOfValue<UserData, number>
    color: AllowedColors
    label: string
}