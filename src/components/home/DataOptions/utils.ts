import isValid from 'date-fns/isValid'
import always from 'ramda/es/always'
import equals from 'ramda/es/equals'
import cond from 'ramda/es/cond'
import join from 'ramda/es/join'
import sort from 'ramda/es/sort'
import alwaysTrue from 'ramda/es/T'
import { UsersInfo, UserInfo } from '../../../types/State'

const inputLabels:Record<string, string> = {
    org: 'Organization',
    repo: 'Repository',
    team: 'Team name (from GitHub Org team url)',
    gitTeamUrl: "Org's team url",
    token: 'Token',
    excludeIds: "Exclude GitHub users e.g. remove bot PRs and comments, ',' separated",
    enterpriseAPI: 'Enterprise API full url',
    userIds: 'Comma separated list GitHub users',
    userId: 'GitHub user ID',
    startDate: 'Joined yyyy/mm/dd',
    endDate: 'Left yyyy/mm/dd',
    events: 'Comma separated list of events (optional)',
    teamName: 'Team name',
    name: 'Name',
}
type DateRange = {
    startDate?: string
    endDate?: string
}
const userHasCorrectDates = ({ dates = []}: UserInfo) => {
    const hasValidDates = dates
        .every(({ startDate = '', endDate = '' }: DateRange) => {
            const validStart = !startDate || isValid(new Date(startDate))
            const validEnd = !endDate || isValid(new Date(endDate))

            return validStart && validEnd
        })

    const allDates: string[] = []
    dates
        .forEach(({ startDate = '', endDate = '' }:DateRange) => {
            startDate && allDates.push(startDate)
            endDate && allDates.push(endDate)
        })

    const sortedDates = sort((a,b) => new Date(a).getTime() - new Date(b).getTime(), allDates)

    const hasCorrectOrder = equals(allDates, sortedDates)

    return hasValidDates
        && hasCorrectOrder
}

const hasValidUsersInfo = (usersInfo = {}) => {
    const validUsersDates = Object.values(usersInfo as UsersInfo)
        .every((info) => userHasCorrectDates(info))

    return  Object.keys(usersInfo).length > 0
        && validUsersDates
}

const validDate = (date = '') =>
    !date || /^\d{4}[/-]\d{2}[/-]\d{2}$/.test(date) && isValid(new Date(date))

const validate = ({ key, value }: { key:string, value: string | UsersInfo }) => {
    const isValid = cond([
        [equals('gitTeamUrl'), always(/^(https:\/\/.+\..+$)/.test(value as string))],
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value as string))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value as string))],
        [equals('events'), always(/^([\w-.,&\s=]+|)$/.test(value as string))],
        [equals('name'), always(/.?/.test(value as string))],
        [equals('usersInfo'), () => hasValidUsersInfo(value as UsersInfo)],
        [equals('startDate'), () => validDate(value as string)],
        [equals('endDate'), () => validDate(value as string)],
        [alwaysTrue, always(/^[\w-_.]+$/.test(value as string))],
    ])(key)
    return isValid
}
const errorValue = <T>(formInfo: T) => (key: keyof T) => {
    const value = formInfo[key] as string | UsersInfo
    const isValid = validate({ key: key as string, value })

    return isValid ? false : true
}

const validateForm = <T extends object>(formInfo: T) => {
    const getErrorValue = errorValue(formInfo)

    const validationErrors: { [key: string]: boolean } = {}
    Object.keys(formInfo)
        .forEach((key) => {
            validationErrors[key] = getErrorValue(key as keyof T)
        })

    const isValid = Object.values(validationErrors)
        .every(x => !x)

    return {
        isValid,
        validationErrors,
    }
}

const formValue = <T>(data: T, key: keyof T) => {
    const value = data[key] as string | number
    const stringVal = typeof value === 'object' ? '' : value
    return Array.isArray(value)
        ? join(', ', value)
        : stringVal
}

export {
    errorValue,
    inputLabels,
    validate,
    formValue,
    validateForm,
}
