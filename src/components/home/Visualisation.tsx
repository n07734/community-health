
import { connect } from 'react-redux'
import {
    cond,
    always,
    propSatisfies,
    T as alwaysTrue,
} from 'ramda'
import Org from '../Org'
import Repo from '../Repo'
import User from '../User'
import PvP from '../PvP'
import Team from '../Team'
import Individual from '../Individual'
import { useSubPage } from '../../state/SubPageProvider'
import { FetchInfo } from '../../types/State'

const Visualisation = (props:any) => {
    const { showPvP, userPage } = useSubPage()
    const showUserPage = userPage && userPage.length > 0 ? true : false
    return (
        <div>
            {
                cond([
                    [always(showPvP), always(<PvP />)],
                    [always(showUserPage) , always(<User />)],
                    [propSatisfies(Boolean, 'teamName'), always(<Team />)],
                    [propSatisfies(x => x.length === 1, 'userIds'), always(<Individual />)],
                    [({ repo, org }) => !repo && org, always(<Org />)],
                    [alwaysTrue, always(<Repo />)],
                ])(props)
            }
        </div>
    )
}

type State = {
    fetches: FetchInfo
}
const mapStateToProps = (state: State) => ({
    userIds: state.fetches.userIds,
    teamName: state.fetches.teamName,
    repo: state.fetches.repo,
    org: state.fetches.org,
})

export default connect(mapStateToProps)(Visualisation)