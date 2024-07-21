import { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@mui/styles'
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
import { trimItems } from '../../state/actions'
import { AnyForLib, FetchInfo, UsersInfo } from '../../types/State'

import { P } from '../shared/StyledTags'

type DateRangeProps = {
    pullRequests: PullRequest[]
    itemsDateRange: string[]
    issues: Issue[]
    usersInfo: UsersInfo
    trim: (from: string, to: string) => void
    classes: Record<string, string>
}
const DateRange = ({
    pullRequests = [],
    itemsDateRange = ['', ''],
    issues = [],
    usersInfo,
    trim,
    classes,
}:DateRangeProps) => {
    const theme: Theme = useTheme();

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

    const handleChange = (_event: any, newValue: number | number[], _activeThumb: number) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            setValue(newValue as [number, number]);
        }
    }

    const handleDone = () => {
        trim(leftDate, rightDate)
    }

    const userCount = Object.keys(usersInfo).length
    const userText = userCount > 1
        ? `by ${userCount} contributors`
        : ''

    const issuesText = issues.length > 0
        ? `and ${issues.length} issues`
        : ''

    return pullRequests.length > 0 && leftDate && <>
            <P className={classes.title}><b>Showing {pullRequests.length} PRs {userText} {issuesText}</b>. Drag the points to change the date range of the report.</P>
            <div className={classes.dates}>
                <P>{format(new Date(leftDate), 'do MMM yy')}</P><P>{format(new Date(rightDate), 'do MMM yy')}</P>
            </div>
            <Slider
                value={[left, right]}
                onChange={handleChange}
                onChangeCommitted={handleDone}
                aria-labelledby="date-slider"
                sx={{
                    '&.MuiSlider-root .MuiSlider-thumb:nth-child(even)': {
                        width: '30px',
                        height: '30px',
                        '&:after': {
                            content: '">"',
                        },
                    },
                    '& .MuiSlider-thumb': {
                        width: '30px',
                        height: '30px',
                        '&:after': {
                            content: '"<"',
                            color: theme.palette.text.primary,
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingBottom: '0.06rem',
                        },
                    },
                }}
            />
        </>
}

type State = {
    pullRequests: PullRequest[]
    issues: Issue[]
    fetches: FetchInfo
    itemsDateRange: string[]
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    issues: state.issues,
    itemsDateRange: state.itemsDateRange,
    usersInfo: state.fetches.usersInfo,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
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
