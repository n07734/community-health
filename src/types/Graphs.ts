
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PullRequest } from './FormattedData'
import { AllowedColors } from './Components'

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

export type CustomLineDataKey = LineDataKey | CustomDataKey | IssuesDataKey

export type LineData = GraphIssue & PullRequest

export type LineDataKeys = keyof LineData

export type LineInfo = {
    label: string
    color: AllowedColors
    data: LineData[]
    filterForKey?: boolean
    groupMath?: GroupMath
    dataKey: LineDataKeys
    lineStyles?: any
    yMax?: number
}

export type Lines = {
    lines: LineInfo[]
    xAxis: 'left' | 'right'
    data: LineData[]
}

export type GraphIssue = {
    bug: number;
    mergedAt: string;
} | {
    issue: number;
    mergedAt: string;
}


export type LineForGraph = {
    id: string
    color: AllowedColors
    data: LinePlot[]
}

export type LinePlot = {
    x: string
    y: number
}

type CalculationArgs = { filteredBatch: LineData[], dataKey: LineDataKeys }
export type GroupMathCalculation = {
    sum: () => number
    average: () => number
    count: () => number
    median: (arg:CalculationArgs) => number
    teamDistribution: (arg:CalculationArgs) => number
    trimmedAverage: (arg:CalculationArgs) => number
    percentWith: (arg:CalculationArgs) => number
    growth: (arg:{ filteredBatch: PullRequest[] }) => number
    averagePerDev: (arg:{ filteredBatch: PullRequest[] }) => number
}

export type GroupMath = keyof GroupMathCalculation

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

export type TableData = {
    [key in ColumnKeys]: string | number | boolean
}

export type BarData = {
    author: string
    name: string } & {
    [key: string]: number
}