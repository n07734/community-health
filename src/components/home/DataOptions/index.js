import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    cond,
    always,
    equals,
} from 'ramda'
import { withStyles } from '@material-ui/core/styles'

import { clearAllData } from '../../../state/actions'

import Paper from '../../shared/Paper'
import Button from '../../shared/Button'

import PrefetchedOptions from './PrefetchedOptions'
import FormSection from './FormSection'
import styles from './styles'

const FetchForm = ({ classes, clearReport }) => {
     const [selectedOption, setLocalOption] = useState('oss')

     const setOption = (option = '') => {
        option !== selectedOption
            && clearReport()
        setLocalOption(option)
     }

     return (
        <Paper className={classes.dataPaper} >
            <div className={classes.typeOptions}>
                {
                    [
                        ['Popular repos/teams', 'oss'],
                        ['Make repo report', 'repo'],
                        ['Make team report', 'team'],
                    ]
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
            </div>
            {
                cond([
                    [equals('oss'), always(<PrefetchedOptions />)],
                    [equals('repo'), always(<FormSection reportType="repo" />)],
                    [equals('team'), always(<FormSection reportType="team" />)],
                ])(selectedOption)
            }
        </Paper>
    )
}

const mapDispatchToProps = dispatch => ({
    clearReport: () => dispatch(clearAllData),
})

export default connect(() => ({}), mapDispatchToProps)(withStyles(styles)(FetchForm))
