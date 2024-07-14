
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import Button from '../../shared/Button'
import Message from '../Message'

import styles from './styles'

const buttonText = (fetching: boolean, pullRequests: any[]) => [
    fetching && 'fetching',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean) as string

type ButtonWithMessageProps = {
    fetching: boolean
    error: {
        level: 'warn' | 'error'
        message: string
    }
    pullRequests: any[]
    classes: Record<string, string>
}
const ButtonWithMessage = (props:ButtonWithMessageProps) => {
    const {
        fetching,
        error,
        pullRequests = [],
        classes,
    } = props

    return (<div className={classes.inputGrid}>
        <Button
            className={`${classes.child} ${classes.fullRow}`}
            type="submit"
            disabled={fetching}
            color="primary"
            value={buttonText(fetching, pullRequests)}
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

type StateProps = {
    fetching: boolean
    error: {
        level: 'warn' | 'error'
        message: string
    }
    pullRequests: any[]
}
const mapStateToProps = (state:StateProps) => ({
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(withStyles(styles)(ButtonWithMessage))
