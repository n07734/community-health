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

const validDate = (date = '') =>
    !date || /^\d{4}\/\d{2}\/\d{2}$/.test(date) && isValid(new Date(date))

const validate = ({ key, value }) => {
    const isValid = cond([
        [equals('gitTeamUrl'), always(/^(https:\/\/.+\..+$)/.test(value))],
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value))],
        [equals('events'), always(/^([\w-.,&\s=]+|)$/.test(value))],
        [equals('name'), always(/.?/.test(value))],
        [equals('userIds'), () => hasValidUsersInfo(value)],
        [equals('usersInfo'), () => Object.keys(value).length > 0],
        [equals('startDate'), () => validDate(value)],
        [equals('endDate'), () => validDate(value)],
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
        validationErrors,
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

const usersInfoToText = (usersInfo = {}) => Object.values(usersInfo)
        .map(({
            dates = [],
            name = '',
            userId = '',
        } = {}) => {
            const usersValues = []
            name
                && usersValues.push(`name:${name}`)

            dates
                .forEach(({startDate, endDate} = {}) => {
                    const dates = []
                    startDate && dates.push(`start:${startDate}`)
                    endDate && dates.push(`start:${endDate}`)

                    const textValue = dates.join(';')
                    usersValues.push(textValue)
                })

            // e.g. userA=start:2023-12-12;end:2023|start:2023-12-12|name:Name
            return `${userId}${usersValues.length > 0 ? `=${usersValues.join('|')}` : ''}`
        })
        .join(', ')

export {
    buttonText,
    errorValue,
    inputLabels,
    validate,
    formValue,
    validateForm,
    usersInfoToText,
}
