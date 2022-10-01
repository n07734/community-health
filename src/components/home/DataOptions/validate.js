import {
    always,
    equals,
    cond,
    T as alwaysTrue,
} from 'ramda'

const validate = ({ key, value }) => {
    const isValid = cond([
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value))],
        [equals('userIds'), always(/^([\w-.,\s]+)$/.test(value))],
        [alwaysTrue, always(/^[\w-.]+$/.test(value))],
    ])(key)
    return isValid
}

export default validate
