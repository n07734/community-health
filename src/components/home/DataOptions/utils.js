import {
    always,
    equals,
    cond,
    join,
    keys,
    T as alwaysTrue,
} from 'ramda'

const inputLabels = {
    org: 'Organization',
    repo: 'Repository',
    token: 'Token*',
    excludeIds: "Exclude GitHub users e.g. remove bot PRs and comments, ',' separated",
    enterpriseAPI: 'Enterprise API full url',
    userIds: 'Comma separated list GitHub users',
    teamName: 'Team name',
}

const validate = ({ key, value }) => {
    const isValid = cond([
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value))],
        [equals('userIds'), always(/^([\w-.,\s:=|]+)$/.test(value))],
        [alwaysTrue, always(/^[\w-.]+$/.test(value))],
    ])(key)
    return isValid
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

const errorValue = formInfo => key => {
    const value = formInfo[key]
    const isValid = validate({ key, value })

    return isValid ? false : true
}

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
