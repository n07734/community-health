
import { connect } from 'react-redux'

import { AmountOfData } from '@/types/Queries'
import { PullRequest } from '@/types/FormattedData'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type SelectAmountDataProps = {
    setValue: (key: string, value: string | object | number) => void
    amountOfData: AmountOfData
    pullRequests: PullRequest[]
    preFetchedName: string
    className?: string
}
const SelectAmountData = (props: SelectAmountDataProps) => {
    const {
        setValue,
        amountOfData,
        pullRequests = [],
        preFetchedName = '',
        className = '',
    } = props

    const hasTeamData = !preFetchedName && pullRequests.length > 0

    const itemText = (amount: number) => `Get ${amount} ${amount === 1 ? 'month' : 'months'} ${hasTeamData ? 'more ' : ''}data`

    return (<Select
        onValueChange={(amountOfData:string ) => setValue('amountOfData', amountOfData === 'all' ? amountOfData : Number(amountOfData))}
        value={`${amountOfData}`}
    >
        <SelectTrigger className={`w-auto ${className}`}>
            <SelectValue>
                {
                    amountOfData === 'all'
                        ? 'Get it all!'
                        : itemText(Number(amountOfData))
                }
            </SelectValue>
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectItem value="1">{itemText(1)}</SelectItem>
                <SelectItem value="3">{itemText(3)}</SelectItem>
                <SelectItem value="6">{itemText(6)}</SelectItem>
                <SelectItem value="12">{itemText(12)}</SelectItem>
                <SelectItem value="24">{itemText(24)}</SelectItem>
                <SelectItem value="all">Get it all!</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
    )
}

type DispatchProps = {
    pullRequests: PullRequest[]
    preFetchedName: string
}
const mapStateToProps = (state:DispatchProps) => ({
    pullRequests: state.pullRequests,
    preFetchedName: state.preFetchedName,
})

export default connect(mapStateToProps)(SelectAmountData)
