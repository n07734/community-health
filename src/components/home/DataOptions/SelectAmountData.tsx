
import { connect } from 'react-redux'
import {
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material'
import { AmountOfData } from '../../../types/Querys'
import { PullRequest } from '../../../types/FormattedData'

type SelectAmountDataProps = {
    setValue: (key: string, value: string | object) => void
    amountOfData: AmountOfData
    pullRequests: PullRequest[]
    preFetchedName: string
}
const SelectAmountData = (props: SelectAmountDataProps) => {
    const {
        setValue,
        amountOfData,
        pullRequests = [],
        preFetchedName = '',
    } = props

    const hasTeamData = !preFetchedName && pullRequests.length > 0

    const itemText = (amount: number) => `Get ${amount} ${amount === 1 ? 'month' : 'months'} ${hasTeamData ? 'more ' : ''}data`

    return (<Select
            value={`${amountOfData}`}
            onChange={(e:SelectChangeEvent) => setValue('amountOfData', (e.target as HTMLSelectElement).value)}
            inputProps={{ 'aria-label': 'Amount of data' }}
        >
        <MenuItem value={1} selected>{itemText(1)}</MenuItem>
        <MenuItem value={3} >{itemText(3)}</MenuItem>
        <MenuItem value={6} >{itemText(6)}</MenuItem>
        <MenuItem value={12} >{itemText(12)}</MenuItem>
        <MenuItem value={24} >{itemText(24)}</MenuItem>
        <MenuItem value="all">Get it all!</MenuItem>
    </Select>)
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
