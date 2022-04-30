import React, { useState } from 'react'
import {
    cond,
    always,
    equals,
} from 'ramda'
import { withStyles } from '@material-ui/core/styles'

import Paper from '../../shared/Paper'
import Button from '../../shared/Button'

import PrefetchedOptions from './PrefetchedOptions'
import RepoData from './RepoData'
import UsersData from './UsersData'
import styles from './styles'

const FetchForm = ({ classes }) => {
     const [selectedOption, setOption] = useState('oss')
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
                    [equals('repo'), always(<RepoData />)],
                    [equals('team'), always(<UsersData />)],
                ])(selectedOption)
            }
        </Paper>
    )
}

export default withStyles(styles)(FetchForm)
