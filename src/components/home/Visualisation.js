
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

const Visualisation = (props) => (
    <div>
        {
            cond([
                [propSatisfies(Boolean, 'pvp'), always(<PvP />)],
                [propSatisfies(Boolean, 'user'), always(<User />)],
                [propSatisfies(Boolean, 'teamName'), always(<Team />)],
                [({ repo, org }) => !repo && org, always(<Org />)],
                [alwaysTrue, always(<Repo />)],
            ])(props)
        }
    </div>
)

const mapStateToProps = (state) => ({
    pvp: state.pvp,
    user: state.user,
    teamName: state.fetches.teamName,
    repo: state.fetches.repo,
    org: state.fetches.org,
})

export default connect(mapStateToProps)(Visualisation)