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
import { getUsersInfo } from '../../../state/actions'

const inputLabels = {
    org: 'Organization',
    repo: 'Repository',
    token: 'Token',
    excludeIds: "Exclude GitHub users e.g. remove bot PRs and comments, ',' separated",
    enterpriseAPI: 'Enterprise API full url',
    userIds: 'Comma separated list GitHub users',
    teamName: 'Team name',
}
const userHasCorrectDates = ({ dates = []} = {}) => {
    const hasValidDates = dates
        .every(({ startDate = '', endDate = '' } = {}) => {
            const validStart = !startDate || isValid(new Date(startDate))
            const validEnd = !endDate || isValid(new Date(endDate))

            return validStart && validEnd
        })

    const allDates = []
    dates
        .forEach(({ startDate = '', endDate = '' } = {}) => {
            startDate && allDates.push(startDate)
            endDate && allDates.push(endDate)
        })

    const sortedDates = sort((a,b) => new Date(a).getTime() - new Date(b).getTime(), allDates)

    const hasCorrectOrder = equals(allDates, sortedDates)

    return hasValidDates
        && hasCorrectOrder
}

const hasValidUsersInfo = (usersString = '') => {
    console.log('hasValidUsersInfo')
    const {
        userIds = [],
        usersInfo = {},
    } = getUsersInfo(usersString)

    const validUsersDates = Object.values(usersInfo)
        .every(userHasCorrectDates)

    return userIds.length > 0
        && validUsersDates
}

const validate = ({ key, value }) => {
    const isValid = cond([
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value))],
        [equals('userIds'), () => hasValidUsersInfo(value)],
        [alwaysTrue, always(/^[\w-.]+$/.test(value))],
    ])(key)
    return isValid
}
const errorValue = formInfo => key => {
    const value = formInfo[key]
    const isValid = validate({ key, value })

    return isValid ? false : true
}

const validateForm = (formInfo) => {
    const getErrorValue = errorValue(formInfo)

    const validationErrors = {}
    keys(formInfo)
        .forEach(key => validationErrors[key] = getErrorValue(key))

    const isValid = Object.values(validationErrors)
        .every(x => !x)

    return {
        isValid,
        validationErrors
    }
}

const buttonText = (fetching, pullRequests = []) => [
    fetching && 'fetching',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean)


const formValue = (data, key) => {
    const value = data[key]
    return Array.isArray(value)
        ? join(', ', value)
        : value
}

export {
    buttonText,
    errorValue,
    inputLabels,
    validate,
    formValue,
    validateForm,
}
