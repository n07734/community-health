import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider';
import {
    add,
    sub,
    format,
    differenceInDays,
} from 'date-fns'

import { P } from '../shared/StyledTags'
import { trimItems } from '../../state/actions'

const DateRange = ({
    pullRequests = [],
    itemsDateRange = ['', ''],
    issues = [],
    releases = [],
    trim,
    classes,
} = {}) => {
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
        ? add(new Date(startDate), { days: leftDays })
        : ''

    const rightDate = endDate
        ? sub(new Date(endDate), { days: daysDiff -  rightDays})
        : ''

    const handleChange = (event, newValue) => {
        setValue(newValue);
    }

    const handleDone = () => {
        trim(leftDate, rightDate)
    }

    console.log('-=-=--leftDate', leftDate)
    console.log('-=-=--rightDate', rightDate)

    return pullRequests.length > 0 && leftDate && <>
            <P className={classes.title}>Show Pull requests in this date range</P>
            <div className={classes.dates}>
                <P>{format(new Date(leftDate), 'do MMM yy')}</P><P>{format(new Date(rightDate), 'do MMM yy')}</P>
            </div>
            <Slider
                value={[left, right]}
                onChange={handleChange}
                onChangeCommitted={handleDone}
                aria-labelledby="date-slider"
            />
            <P>{pullRequests.length > 0 && `Pull requests: ${pullRequests.length}`}{ issues.length > 0 && `, Issues: ${issues.length}`}</P>
        </>
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    issues: state.issues,
    releases: state.releases,
    itemsDateRange: state.itemsDateRange,
})

const mapDispatchToProps = dispatch => ({
    trim: (from,to) => dispatch(trimItems(from,to)),
})

const styles = theme => ({
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
