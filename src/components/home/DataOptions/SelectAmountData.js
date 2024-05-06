
import { connect } from 'react-redux'
import {
    Select,
    MenuItem,
} from '@material-ui/core'

const SelectAmountData = (props = {}) => {
    const {
        setValue,
        amountOfData,
        pullRequests = [],
        preFetchedName = '',
    } = props

    const hasTeamData = !preFetchedName && pullRequests.length > 0

    const itemText = (amount) => `Get ${amount} ${amount === 1 ? 'month' : 'months'} ${hasTeamData ? 'more ' : ''}data`

    return (<Select
            value={amountOfData}
            onChange={(e) => setValue('amountOfData', e.target.value)}
            inputProps={{ 'aria-label': 'Amount of data' }}
        >
        <MenuItem value={1} default>{itemText(1)}</MenuItem>
        <MenuItem value={3} >{itemText(3)}</MenuItem>
        <MenuItem value={6} >{itemText(6)}</MenuItem>
        <MenuItem value={12} >{itemText(12)}</MenuItem>
        <MenuItem value={24} >{itemText(24)}</MenuItem>
        <MenuItem value="all">Get it all!</MenuItem>
    </Select>)
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    preFetchedName: state.preFetchedName,
})

export default connect(mapStateToProps)(SelectAmountData)
