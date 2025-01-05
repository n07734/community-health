import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import add from 'date-fns/add'
import sub from 'date-fns/sub'
import format from 'date-fns/format'
import formatISO from 'date-fns/formatISO'
import differenceInDays from 'date-fns/differenceInDays'

import { Slider } from "@/components/ui/slider"
import { trimItems, useDataStore } from '@/state/fetch'

// Need to store the last change values to be as sometimes the onValueCommit is not triggered correctly
let lastChangeValues: number[] = []

type GetDateRange = {
    startDate: string
    endDate: string
    left: number
    right: number
}
const getDateRange = ({startDate, endDate, left, right }: GetDateRange) => {
    const daysDiff = differenceInDays(new Date(endDate), new Date(startDate))
    const dayPercent = daysDiff / 100

    const leftDays = Math.floor(dayPercent * left)
    const rightDays = Math.ceil(dayPercent * right)

    const leftDate = startDate
        ? formatISO(add(new Date(startDate), { days: leftDays }), { representation: 'date' })
        : ''

    const rightDate = endDate
        ? formatISO(sub(new Date(endDate), { days: daysDiff -  rightDays}), { representation: 'date' })
        : ''

    return [leftDate, rightDate]
}

const DateSlider = () => {
    const itemsDateRange = useDataStore(useShallow(state => state.itemsDateRange))
    const [startDate, endDate] = itemsDateRange

    const [[left, right], setValue] = useState([0, 100])
    const [leftDate, rightDate] = getDateRange({startDate, endDate, left, right})

    const handleChange = (newValue: number[]) => {
        lastChangeValues = newValue

        if (Array.isArray(newValue) && newValue.length === 2) {
            setValue(newValue as [number, number]);
        }
    }

    const handleDone = (newValue: number[]) => {
        const [left, right] = lastChangeValues.length ? lastChangeValues : newValue
        const [leftDate, rightDate] = getDateRange({ startDate, endDate, left, right })
        lastChangeValues = []

        trimItems(leftDate, rightDate)
    }

    const onLostPointerCapture = () => {
        if  (!lastChangeValues.length) return

        const [left, right] = lastChangeValues
        const [leftDate, rightDate] = getDateRange({ startDate, endDate, left, right })
        lastChangeValues = []

        trimItems(leftDate, rightDate)
    }

    return <>
        <div className="w-full flex justify-between">
            <p className="text-2xl mb-1">{format(new Date(leftDate), 'do MMM yy')}</p><p className="text-2xl mb-1">{format(new Date(rightDate), 'do MMM yy')}</p>
        </div>
        <Slider
            value={[left, right]}
            onValueChange={handleChange}
            onValueCommit={handleDone}
            className="pb-08"
            onLostPointerCapture={onLostPointerCapture}
        />
    </>
}


export default DateSlider
