type AllowedColors = '#E82573' | '#8b4ff0' | '#1F77B4' | '#4ECC7A' | '#DBD523' | '#EB9830' | '#D14B41'

type InitialUserValues = {
    name: string
    dates: UserDate[]
}
type UserValues = InitialUserValues &{
    userId: string
}
export type Users = {
    [key: string]: UserValues
}

export type AnyObject = {
    [key: string]: any
}

export type ObjNumbers = {
    [key: string]: number
}
export type ObjStrings = {
    [key: string]: string
}
export type ObjPrimitive = {
    [key: string]: string | number
}

export type PieData = {
    id: string
    label: string
    color: AllowedColors
    value: number
}
export type PieInfo = {
    pieData: PieData[]
    reportItems: string[]
    pieTitle: string
    sectionTitle: string
}

export type RadarDataItem = {
    area: string
    value: number
    [`${string}Original`]: number
}
export type RadarData = {
    title: string
    data: RadarDataItem[]
    keys: string[]
}