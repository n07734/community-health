
import {
    getDownloadProps,
} from '../../../state/actions'
import { useDataStore, useFetchStore } from '@/state/fetch'

const Download = () => {
    const pullRequests = useDataStore(state => state.pullRequests)
    const fetching = useFetchStore((state) => state.fetching)

    const info = getDownloadProps()
    return !fetching && pullRequests.length > 0
        ? <p><a className="text-primary" {...info}>Download report data</a></p>
        : null
}

export default Download
