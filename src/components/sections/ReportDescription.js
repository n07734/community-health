import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch';
import { always, cond, T, propSatisfies, where } from 'ramda'

import { H, P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import PretetchedForm from '../home/DataOptions/PretetchedForm'
import DateRange from './DateRange'
import { hideUserNames } from '../../state/actions'

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

const ReportDescription = ({
    fetches = {},
    preFetchedName = '',
    pullRequests = [],
    issues = [],
    userIds = [],
    reportDescription = '',
    hideNames = () => {},
    classes
} = {}) => {
    const [state, setState] = useState(false);
    const handleChange = (event) => {
        setState(event.target.checked);
        hideNames(event.target.checked)
    };

    const hasReportData = pullRequests.length > 0 || issues.length > 0

    return hasReportData && (<Paper className={classes.root}>
            <H className={classes.heading} level={2}>
                {
                    titleCopy(fetches)
                }
            </H>
            {
                reportDescription
                    && <P>{reportDescription}</P>
            }
            {
                userIds.length > 0
                    && <P>
                        {
                            userIds.join(', ')
                        }
                    </P>
            }
            <Switch
                checked={state}
                onChange={handleChange}
                name="checkedA"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
            <P className={classes.toggle}>Toggle to hide GitHub usernames, this can help look for trends.</P>
            <DateRange />
            {
                preFetchedName.length > 0
                    && <PretetchedForm />
            }
        </Paper>)
}

const mapStateToProps = (state) => ({
    fetches: state.fetches,
    preFetchedName: state.preFetchedName,
    pullRequests: state.pullRequests,
    issues: state.issues,
    userIds: state.fetches.userIds,
    reportDescription: state.reportDescription,
})

const mapDispatchToProps = dispatch => ({
    hideNames: (x) => dispatch(hideUserNames(x)),
})

const styles = theme => ({
    root: {
        display: 'block'
    },
    heading: theme.copy.h1,
    toggle: {
        display: 'inline-block'
    }
})

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(ReportDescription))
