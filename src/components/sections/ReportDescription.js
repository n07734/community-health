import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { always, cond, T, propSatisfies, where } from 'ramda'

import { H, P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import PretetchedForm from '../home/DataOptions/PretetchedForm'

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
    releases = [],
    userIds = [],
    classes
} = {}) => {
    const releaseCount = releases.length

    const hasReportData = pullRequests.length > 0 || issues.length > 0

    return hasReportData && (<Paper className={classes.root}>
            <H className={classes.heading} level={2}>
                {
                    titleCopy(fetches)
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
            <P>{pullRequests.length > 0 && `Pull requests: ${pullRequests.length}`}{ issues.length > 0 && `, Issues: ${issues.length}`}{ releaseCount > 0 && `, Releases: ${releaseCount}`}</P>
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
    releases: state.releases,
    userIds: state.fetches.userIds,
})

const styles = theme => ({
    root: {
        display: 'block'
    },
    heading: theme.copy.h1,
})

export default connect(mapStateToProps)(withStyles(styles)(ReportDescription))