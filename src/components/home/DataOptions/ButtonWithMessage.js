import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Button from '../../shared/Button'
import Message from '../Message'
import { buttonText } from './utils'
import styles from './styles'

const ButtonWithMessage = (props) => {
    const {
        fetching,
        error,
        pullRequests = [],
        classes,
    } = props

    return (<div className={classes.inputGrid}>
        <Button
            className={`${classes.child} ${classes.fullRow}`}
            type={fetching ? 'disabled' : 'submit'}
            variant="contained"
            color="primary"
            value={buttonText(fetching, '', pullRequests)}
        />
        {
            error
                && <Message
                    error={error}
                    className={classes.fullRow}
                />
        }
    </div>)
}

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(withStyles(styles)(ButtonWithMessage))
