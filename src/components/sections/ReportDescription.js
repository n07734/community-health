import React from 'react'
import { connect } from 'react-redux'
import format from 'date-fns/format'
import max from 'date-fns/max'
import min from 'date-fns/min'
import { withStyles } from '@material-ui/core/styles'

import { H, P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import { always, cond, T, propSatisfies, where } from 'ramda'

const RepoOrgCopy = ({ repo, org } = {}) => org === repo
    ? (<span style={{ color: '#e82573' }}>{repo}</span>)
    : (
        <>
            <span style={{ color: '#1f77b4' }}>{org}</span>/<span style={{ color: '#e82573' }}>{repo}</span>
        </>
    )

const TeamName = ({ teamName }) => <span style={{ color: '#e82573' }}>{teamName}</span>

const titleCopy = cond([
    [
        where({
            org: Boolean,
            repo: Boolean,
        }),
        RepoOrgCopy,
    ],
    [
        propSatisfies(Boolean,'teamName'),
        TeamName,
    ],
    [
        T,
        always('Report'),
    ],
])

const formatDate = date => format(date, 'yyyy/MM/dd')

const ReportDescription = ({ reportInfo, classes } = {}) => {
    const {
        prCount = 0,
        issueCount = 0,
        releaseCount = 0,
        startDate = '',
        endDate = '',
        userIds = [],
    } = reportInfo

    const dates = [new Date(endDate), new Date(startDate)]
    const maxDate = max(dates)
    const minDate = min(dates)

    return <Paper className={classes.root}>
            <H className={classes.heading} level={2}>
                {
                    titleCopy(reportInfo)
                }
            </H>
            {
                userIds.length > 0
                    && <P>
                        {
                            userIds.join(', ')
                        }
                    </P>
            }
            {
                startDate && endDate && <P>Data from {formatDate(minDate)} until {formatDate(maxDate)}</P>
            }
            <P>Pull requests: {prCount}, Issues: {issueCount}{ releaseCount > 0 && `, Releases: ${releaseCount}`}</P>
        </Paper>
}

const mapStateToProps = (state) => ({
    reportInfo: state.reportInfo,
})

const styles = theme => ({
    root: {
        display: 'block'
    },
    heading: theme.copy.h1,
})

export default connect(mapStateToProps)(withStyles(styles)(ReportDescription))
