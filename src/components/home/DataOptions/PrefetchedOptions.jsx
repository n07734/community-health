import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import Button from '../../shared/Button'
import Message from '../Message'
import { P, A } from '../../shared/StyledTags'
import styles from './styles'
import { getPreFetched } from '../../../state/actions'
import { useSubPage } from '../../../state/SubPageProvider'
import {
    preFetchedSRank23,
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
} from '../../../preFetchedInfo'

import {
    myPreFetchedReports,
} from '../../../myReports/myReportsConfig'

const PrefetchedOptions = (props = {}) => {
    const {
        classes,
        error,
        preFetchedName = '',
        getPreFetchedReport,
    } = props
    const { togglePvPPage, setUserPage } = useSubPage()
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString)

    const player1 = urlParams.get('player1') || ''
    const player2 = urlParams.get('player2') || ''
    const user = urlParams.get('user') || ''

    const allItems = [
        ...myPreFetchedReports,
        ...preFetchedRepos,
        ...preFetchedTeams,
        ...preFetchedOrgs,
    ]

    const report = urlParams.get('report') || myPreFetchedReports[0]?.fileName || 'vitejs'

    const isAPreFetchedReport = allItems
        .some(x => x.fileName === report)
    const repoInfo = isAPreFetchedReport
        ? allItems
            .find(x => x.fileName === (preFetchedName || report))
        : { fileName: report }

    useEffect(() => {
        getPreFetchedReport(repoInfo)
        if (player1 && player2) {
            console.log('player1', player1)
            console.log('player2', player2)
            togglePvPPage()
        } else if (user) {
            setUserPage(user)
        }
    }, [getPreFetchedReport, player1, player2, user])

    const preFetchButton = (repoInfo = {}, i) => <Button
        value={repoInfo.name}
        key={i}
        color={preFetchedName === repoInfo.fileName ? 'primary' : 'secondary'}
        onClick={(e) => {
            e.preventDefault()
            getPreFetchedReport(repoInfo)
        }}
    />

    const [showAllReports, setAllReports] = useState(false)

    return (
        <div className={classes.preFetched}>
            {
                myPreFetchedReports
                    .map(preFetchButton)
            }
            <div>
                <P><A href="https://2023.stateofjs.com/en-US/libraries/#tier_list">StateOfJS 23</A> S tier list</P>
                {
                    preFetchedSRank23
                        .map(preFetchButton)
                }
            </div>
            <P>Other reports</P>

            {
                !myPreFetchedReports.length > 0 && <>
                    {
                        !showAllReports && repoInfo && Object.keys(repoInfo).length > 0
                            && preFetchButton(repoInfo)
                    }
                    {
                        showAllReports
                            && <>
                            <P>
                                Repository reports
                            </P>
                            {
                                preFetchedRepos
                                    .map(preFetchButton)
                            }
                            <P>
                                Org reports
                            </P>
                            {
                                preFetchedOrgs
                                    .map(preFetchButton)
                            }
                            <P>Team reports</P>
                            {
                                preFetchedTeams
                                    .map(preFetchButton)
                            }
                        </>
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
                <Button
                    value={showAllReports ? 'Hide other reports' : 'Show more OSS reports...'}
                    color={showAllReports ? 'primary' : 'secondary'}
                    onClick={(e) => {
                        e.preventDefault()
                        setAllReports(!showAllReports)
                    }}
                />
        </div>
    )
}

const mapStateToProps = (state) => ({
    preFetchedName: state.preFetchedName,
    error: state.preFetchedError,
})

const mapDispatchToProps = dispatch => ({
    getPreFetchedReport: (x) => dispatch(getPreFetched(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PrefetchedOptions))
