
import { connect } from 'react-redux'

import { PullRequest } from '@/types/FormattedData'

import { Button } from '@/components/ui/button'
import Message from '@/components/home/Message'

const buttonText = (fetching: boolean, pullRequests: PullRequest[]) => [
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
    pullRequests: PullRequest[]
    qaId?: string
}
const ButtonWithMessage = (props:ButtonWithMessageProps) => {
    const {
        fetching,
        error,
        pullRequests = [],
        qaId,
    } = props
    return (<div className="grid grid-cols-1 gap-2 max-mm:grid-cols-2">
        <Button
            className="m-0 w-full col-span-full"
            type="submit"
            disabled={fetching}
            color="primary"
            value={buttonText(fetching, pullRequests)}
            data-qa-id={qaId}
        />
        {
            error
                && <Message
                    error={error}
                    className="col-span-full"
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
    pullRequests: PullRequest[]
}
const mapStateToProps = (state:StateProps) => ({
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
})

export default connect(mapStateToProps)(ButtonWithMessage)
