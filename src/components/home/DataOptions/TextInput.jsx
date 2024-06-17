
import { TextField } from '@mui/material'
import { withStyles } from '@mui/styles'

import { pathOr } from 'ramda'

import styles from './styles'
import {
    inputLabels,
    formValue,
    validate,
} from './utils'

const TextInput = (props) => {
    const {
        type,
        classes,
        className = '',
        inputError = {},
        setInputError = () => {},
        formInfo = {},
        setValue,
    } = props

    const inputProps = {
        label: inputLabels[type],
        className: `${className} ${classes.child}`,
        error: inputError[type] || false,
        value: formValue(formInfo, type),
        variant: 'outlined',
        margin: 'normal',
        helperText: inputError[type] && 'Invalid input',
        onBlur: (event) => {
            const value = pathOr('', ['target', 'value'], event)

            const isValid = validate({ key: type, value })
            setInputError({
                ...inputError,
                [type]: isValid ? false : true,
            })

            isValid
                && setValue(type, value)
        },
        onChange: (event) => {
            const value = pathOr('', ['target', 'value'], event)
            setInputError({
                ...inputError,
                [type]: false,
            })

            setValue(type, value)
        },
        onFocus: () => setInputError({
            ...inputError,
            [type]: false,
        }),
    }


    return <TextField
        {...inputProps }
    />
}

export default withStyles(styles)(TextInput)
