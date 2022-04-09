import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import Paper from '../../shared/Paper'
import PrefetchedOptions from './PrefetchedOptions'
import RepoData from './RepoData'
import UsersData from './UsersData'
import styles from './styles'

const FetchForm = ({ classes }) => (
    <Paper className={classes.dataPaper} >
        <PrefetchedOptions />
        <RepoData />
        <UsersData />
    </Paper>
)

export default withStyles(styles)(FetchForm)
