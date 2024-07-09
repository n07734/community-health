import { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'
import Slider from '@mui/material/Slider'
import { Theme } from '@mui/material/styles'
import {
    add,
    sub,
    format,
    formatISO,
    differenceInDays,
} from 'date-fns'
import { PullRequest, Issue } from '../../types/FormattedData'

import { P } from '../shared/StyledTags'
import { trimItems } from '../../state/actions'

type DateRangeProps = {
    pullRequests: PullRequest[];
    itemsDateRange: string[];
    issues: Issue[];
    trim: (from: string, to: string) => void;
    classes: any;
}
const DateRange = ({
    pullRequests = [],
    itemsDateRange = ['', ''],
    issues = [],
    trim,
    classes,
}:DateRangeProps) => {
    /// need stable start and end dates
    const [startDate, endDate] = itemsDateRange

    const daysDiff = startDate
        ? differenceInDays(new Date(endDate), new Date(startDate))
        : 0

    const dayPercent = daysDiff / 100

    const [[left, right], setValue] = useState([0, 100])

    const leftDays = Math.floor(dayPercent * left)
    const rightDays = Math.ceil(dayPercent * right)

    const leftDate = startDate
        ? formatISO(add(new Date(startDate), { days: leftDays }), { representation: 'date' })
        : ''

    const rightDate = endDate
        ? formatISO(sub(new Date(endDate), { days: daysDiff -  rightDays}), { representation: 'date' })
        : ''

    const handleChange = (event: any, newValue: number | number[], activeThumb: number) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            setValue(newValue as [number, number]);
        }
    }

    const handleDone = () => {
        trim(leftDate, rightDate)
    }

    return pullRequests.length > 0 && leftDate && <>
            <P className={classes.title}>Drag the points to change the date range of the report. Showing {pullRequests.length} PRs and {issues.length} issues </P>
            <div className={classes.dates}>
                <P>{format(new Date(leftDate), 'do MMM yy')}</P><P>{format(new Date(rightDate), 'do MMM yy')}</P>
            </div>
            <Slider
                value={[left, right]}
                onChange={handleChange}
                onChangeCommitted={handleDone}
                aria-labelledby="date-slider"
            />
        </>
}

type State = {
    pullRequests: PullRequest[];
    issues: Issue[];
    itemsDateRange: string[]
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    issues: state.issues,
    itemsDateRange: state.itemsDateRange,
})

const mapDispatchToProps = (dispatch:any) => ({
    trim: (from:string,to:string) => dispatch(trimItems(from,to)),
})

const styles = (theme:Theme) => ({
    title: {
        width: '100%',
    },
    dates: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        '& > p': {
            margin: 0,
            color: theme.palette.primary.main,
            fontSize: '1.4rem',
        },
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DateRange))
