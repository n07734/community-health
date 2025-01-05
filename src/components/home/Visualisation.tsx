import Org from '../Org'
import Repo from '../Repo'
import User from '../User'
import PvP from '../PvP'
import Team from '../Team'
import Individual from '../Individual'
import { useSubPage } from '../../state/SubPageProvider'
import { useFetchStore } from '@/state/fetch'

const Visualisation = () => {
    const { showPvP, userPage } = useSubPage()
    const showUserPage = userPage && userPage.length > 0 ? true : false
    const isSubPage = showPvP || showUserPage
    const reportType = useFetchStore((state) => state.reportType)

    return (
        <div>
            {
                showPvP && <PvP />
            }
            {
                showUserPage && <User />
            }
            {
                !isSubPage && reportType === 'team' && <Team />
            }
            {
                !isSubPage && reportType === 'user' && <Individual />
            }
            {
                !isSubPage && reportType === 'org' && <Org />
            }
            {
                !isSubPage && reportType === 'repo' && <Repo />
            }
        </div>
    )
}

export default Visualisation
