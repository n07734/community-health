import { useState } from 'react'
import { connect } from 'react-redux'
import {
    cond,
    always,
    equals,
} from 'ramda'
import { withStyles } from '@mui/styles'

import { clearAllData } from '../../../state/actions'

import Paper from '../../shared/Paper'
import Button from '../../shared/Button'

import PrefetchedOptions from './PrefetchedOptions'
import FormSection from './FormSection'
import styles from './styles'
import {
    myPreFetchedReports,
} from '../../../myReports/myReportsConfig'
import {
    preFetchedRepos,
    preFetchedOrgs,
    preFetchedTeams,
} from '../../../preFetchedInfo'

const FetchForm = ({ classes, clearReport }) => {
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString);
    const chosenReport =  urlParams.get('report') || myPreFetchedReports[0]?.fileName || 'facebook-react'

    const allPreFetched = [
        ...preFetchedRepos,
        ...preFetchedOrgs,
        ...preFetchedTeams,
        ...myPreFetchedReports,
    ]
    const isAnOSSReport = allPreFetched
        .some(x => x.fileName === chosenReport)

    const [selectedOption, setLocalOption] = useState('oss')

    const setOption = (option = '') => {
        option !== selectedOption
            && clearReport()
        setLocalOption(option)
    }

    const ossCopy = myPreFetchedReports.length > 0
        ? 'Saved and OSS Reports'
        : 'OSS Reports'

    const preFetchedText = myPreFetchedReports.length > 0
        ? 'Saved Reports'
        : ossCopy

    const allTypes = [
        ...( isAnOSSReport ? [[preFetchedText, 'oss']] : []),
        ['Make individual report', 'user'],
        ['Make team report', 'team'],
        ['Make repo report', 'repo'],
        ['Make org report', 'org'],
    ]
    const [showAllTypes, setAllTypes] = useState(false)

    const showTypes = showAllTypes || (!isAnOSSReport && selectedOption === 'oss')
        ? allTypes
        : [allTypes.find(([, type]) => type === selectedOption)]

    const showText = selectedOption === 'oss'
        ? 'Make a report...'
        : 'Show all'
    return (
        <Paper className={classes.dataPaper} >
            <div className={classes.typeOptions}>
                {
                    showTypes
                        .map(([text, type], i) => <Button
                            value={text}
                            key={i}
                            color={selectedOption === type ? 'primary' : 'secondary'}
                            onClick={(e) => {
                                e.preventDefault()
                                setOption(type)
                            }}
                        />)
                }
                {
                    <Button
                        value={showAllTypes ? 'Hide unselected' : showText}
                        color={showAllTypes ? 'primary' : 'secondary'}
                        onClick={(e) => {
                            e.preventDefault()
                            setAllTypes(!showAllTypes)
                        }}
                    />
                }
            </div>
            {
                cond([
                    [equals('oss'), always(<PrefetchedOptions />)],
                    [equals('repo'), always(<FormSection reportType="repo" />)],
                    [equals('org'), always(<FormSection reportType="org" />)],
                    [equals('team'), always(<FormSection reportType="team" />)],
                    [equals('user'), always(<FormSection reportType="user" />)],
                ])(selectedOption)
            }
        </Paper>
    )
}

const mapDispatchToProps = dispatch => ({
    clearReport: () => dispatch(clearAllData),
})

export default connect(() => ({}), mapDispatchToProps)(withStyles(styles)(FetchForm))