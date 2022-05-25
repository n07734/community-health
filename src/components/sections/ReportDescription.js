import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { always, cond, T, propSatisfies, where } from 'ramda'

import { H, P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import FormSection from '../home/DataOptions/FormSection'

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
    pullRequests = [],
    issues = [],
    releases = [],
    userIds = [],
    classes
} = {}) => {
    const releaseCount = releases.length

    const reportType = userIds.length > 0
        ? 'team'
        : 'repo'

    return <Paper className={classes.root}>
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
            {
                // TODO: get start and end date info
            }
            <P>Pull requests: {pullRequests.length}{ issues.length > 0 && `, Issues: ${issues.length}`}{ releaseCount > 0 && `, Releases: ${releaseCount}`}</P>
            <ChartDescription
                className={`${classes.formDescription} ${classes.fullRow}`}
                title=""
                expandText="here"
                intro="Top up this report's data"
            >
                {
                    reportType === 'team'
                        ? <FormSection reportType="team" preFetchedReport={true}/>
                        : <FormSection reportType="repo" preFetchedReport={true} />
                }
            </ChartDescription>
        </Paper>
}

const mapStateToProps = (state) => ({
    fetches: state.fetches,
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
