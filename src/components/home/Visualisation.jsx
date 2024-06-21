
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

const Visualisation = (props) => {
    const { showPvP, userPage } = useSubPage()
    return (
        <div>
            {
                cond([
                    [always(showPvP), always(<PvP />)],
                    [always(userPage), always(<User />)],
                    [propSatisfies(Boolean, 'teamName'), always(<Team />)],
                    [propSatisfies(x => x.length === 1, 'userIds'), always(<Individual />)],
                    [({ repo, org }) => !repo && org, always(<Org />)],
                    [alwaysTrue, always(<Repo />)],
                ])(props)
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    pvp: state.pvp,
    user: state.user,
    userIds: state.fetches.userIds,
    teamName: state.fetches.teamName,
    repo: state.fetches.repo,
    org: state.fetches.org,
})

export default connect(mapStateToProps)(Visualisation)