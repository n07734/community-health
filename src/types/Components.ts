/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserDate } from './State'

export type AllowedColors = '#E82573' | '#8b4ff0' | '#1F77B4' | '#4ECC7A' | '#DBD523' | '#EB9830' | '#D14B41'

export type UserValues = {
    userId: string
    name: string
    dates: UserDate[]
}
export type Users = {
    [key: string]: UserValues
}

export type AnyObject = {
    [key: string]: any
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
    [key: `${string}Original`]: number
}
export type RadarData = {
    title: string
    data: RadarDataItem[]
    keys: Array<keyof RadarDataItem>
}