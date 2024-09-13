
import pathOr from 'ramda/es/pathOr'

import { AnyForNow } from '@/types/State'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    inputLabels,
    formValue,
    validate,
} from './utils'

type InputError = {
    [key: string]: boolean
}
type TextInputProps = {
    type: string
    className?: string
    inputError?: InputError
    setInputError?: (arg: InputError) => void
    formInfo?: AnyForNow
    setValue: AnyForNow
}
const TextInput = (props:TextInputProps) => {
    const {
        type,
        className = '',
        inputError = {},
        setInputError = () => {},
        formInfo = {},
        setValue,
    } = props

    const errorClass = inputError[type]
        ? 'border-red-500'
        : ''
    return <Label>
        <p className="mb-1 block">
            {inputLabels[type]}
        </p>
        <Input
            className={`${className} m-0 w-full ${errorClass}`}
            value={formValue(formInfo, type)}
            type={type}
            onBlur={(event:React.FocusEvent<HTMLInputElement>) => {
                const value = pathOr('', ['target', 'value'], event)

                const isValid = validate({ key: type, value })
                setInputError({
                    ...inputError,
                    [type]: isValid ? false : true,
                })

                isValid
                && setValue(type, value)
            }}
            onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                const value = pathOr('', ['target', 'value'], event)
                setInputError({
                    ...inputError,
                    [type]: false,
                })

                setValue(type, value)
            }}
            onFocus={() => setInputError({
                ...inputError,
                [type]: false,
            })}
        />
        <p className="text-red-500 text-xs">
            {inputError[type] && 'Invalid input'}
        </p>
    </Label>
}

export default TextInput
