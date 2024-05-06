import { useEffect } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { pathOr } from 'ramda'

import Button from '../../shared/Button'
import Message from '../Message'
import { P } from '../../shared/StyledTags'
import styles from './styles'
import {
    getPreFetched,
    setPvP,
} from '../../../state/actions'
import {
    preFetchedRepos,
    preFetchedTeams,
} from '../../../preFetchedInfo'

import {
    onlyShowMyReports,
    myPreFetchedReports,
} from '../../../myReports/myReportsConfig'

const PrefetchedOptions = (props = {}) => {
    const {
        classes,
        error,
        preFetchedName = '',
        getPreFetchedReport,
        setPvPArena,
    } = props

    useEffect(() => {
        const quertString = pathOr('', ['location', 'search'], window)
        const urlParams = new URLSearchParams(quertString);
        const path = pathOr('', ['location', 'pathname'], window)
        const [reportPath, p1Path, p2Path] = /^[\w-/]+$/.test(path)
            ? path
                .split('/')
                .filter(x => x && x !== 'community-health')
            : []
        const player1 = p1Path || urlParams.get('player1') || '';
        const player2 = p2Path || urlParams.get('player2') || '';

        const allItems = [
            ...myPreFetchedReports,
            ...preFetchedRepos,
            ...preFetchedTeams,
        ]

        const reportFromPath = allItems.some(x => x.fileName === reportPath)
            ?  reportPath
            : ''

        const report = myPreFetchedReports[0]?.fileName || reportFromPath || urlParams.get('report') || 'facebook-react';

        const repoInfo = allItems
            .find(x => x.fileName === report)

        if (reportFromPath && player1 && player2) {
            setPvPArena()
        }

        getPreFetchedReport(repoInfo)
    }, [getPreFetchedReport, setPvPArena])

    const preFetchButton = (repoInfo = {}, i) => <Button
        value={repoInfo.name}
        key={i}
        color={preFetchedName === repoInfo.fileName ? 'primary' : 'secondary'}
        onClick={(e) => {
            e.preventDefault()
            getPreFetchedReport(repoInfo)
        }}
    />

    // TODO: ajax prefetched on load? or have first in bundle
    return (
        <div className={classes.preFetched}>
            {
                myPreFetchedReports
                    .map(preFetchButton)
            }
            {
                !onlyShowMyReports && <>
                    <P>
                        See community contribution health of some popular Open Source repositories.
                    </P>
                    {
                        preFetchedRepos
                            .map(preFetchButton)
                    }
                    <P>See contribution health of some popular OSS teams</P>
                    {
                        preFetchedTeams
                            .map(preFetchButton)
                    }
                    {
                        error
                            && <Message
                                error={error}
                                className={classes.fullRow}
                            />
                    }
                </>
            }
            </div>
    )
}

const mapStateToProps = (state) => ({
    preFetchedName: state.preFetchedName,
    error: state.preFetchedError,
})

const mapDispatchToProps = dispatch => ({
    setPvPArena: (x) => dispatch(setPvP(x)),
    getPreFetchedReport: (x) => dispatch(getPreFetched(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PrefetchedOptions))
