import { PullRequest } from '@/types/FormattedData'

import { Button } from '@/components/ui/button'
import Message from '@/components/home/Message'
import { useDataStore, useFetchStore } from '@/state/fetch'

const buttonText = (fetching: boolean, pullRequests: PullRequest[]) => [
    fetching && 'fetching',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean) as string

const ButtonWithMessage = ({ qaId = ''}) => {
    const pullRequests = useDataStore(state => state.pullRequests)
    const {
        fetching = false,
        error,
    } = useFetchStore((state) => state)

    return (<div className="grid grid-cols-1 gap-2 max-mm:grid-cols-2">
        <Button
            className="m-0 w-full col-span-full"
            type="submit"
            disabled={fetching}
            color="primary"
            data-qa-id={qaId}
        >
            {buttonText(fetching, pullRequests)}
        </Button>
        {
            error?.message
                && <Message
                    error={error}
                    className="col-span-full"
                />
        }
    </div>)
}

export default ButtonWithMessage
