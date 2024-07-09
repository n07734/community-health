import { isValid } from 'date-fns'
import {
    always,
    equals,
    cond,
    join,
    keys,
    sort,
    T as alwaysTrue,
} from 'ramda'
import { ObjStrings } from '../../../types/Components'

const inputLabels: ObjStrings = {
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
    startDate: string
    endDate: string
}
const userHasCorrectDates = ({ dates = []}: { dates:DateRange[] }) => {
    const hasValidDates = dates
        .every(({ startDate = '', endDate = '' }:DateRange) => {
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
    const validUsersDates = Object.values(usersInfo)
        .every((info: any) => userHasCorrectDates(info))

    return  Object.keys(usersInfo).length > 0
        && validUsersDates
}

const validDate = (date = '') =>
    !date || /^\d{4}\/\d{2}\/\d{2}$/.test(date) && isValid(new Date(date))

const validate = ({ key, value }: { key:string, value: any }) => {
    const isValid = cond([
        [equals('gitTeamUrl'), always(/^(https:\/\/.+\..+$)/.test(value))],
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value))],
        [equals('events'), always(/^([\w-.,&\s=]+|)$/.test(value))],
        [equals('name'), always(/.?/.test(value))],
        [equals('usersInfo'), () => hasValidUsersInfo(value)],
        [equals('startDate'), () => validDate(value)],
        [equals('endDate'), () => validDate(value)],
        [alwaysTrue, always(/^[\w-_.]+$/.test(value))],
    ])(key)
    return isValid
}
const errorValue = (formInfo: any) => (key: string) => {
    const value = formInfo[key]
    const isValid = validate({ key, value })

    return isValid ? false : true
}

const validateForm = (formInfo: any) => {
    const getErrorValue = errorValue(formInfo)

    const validationErrors: { [key: string]: boolean } = {}
    keys(formInfo)
        .forEach((key: any) => {
            validationErrors[key] = getErrorValue(key)
    })

    const isValid = Object.values(validationErrors)
        .every(x => !x)

    return {
        isValid,
        validationErrors,
    }
}

const formValue = (data: any, key: string) => {
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
