
import { connect } from 'react-redux'
import cond from 'ramda/es/cond'
import always from 'ramda/es/always'
import propSatisfies from 'ramda/es/propSatisfies'
import alwaysTrue from 'ramda/es/T'

import Org from '../Org'
import Repo from '../Repo'
import User from '../User'
import PvP from '../PvP'
import Team from '../Team'
import Individual from '../Individual'
import { useSubPage } from '../../state/SubPageProvider'

type VisualisationProps = {
    userIds: string[]
    teamName: string
    repo: string
    org: string
}
const Visualisation = (props:VisualisationProps) => {
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
                    [({ repo, org }: { repo: string, org:string }) => (repo === '' && org && org.length > 0) as boolean, always(<Org />)],
                    [alwaysTrue, always(<Repo />)],
                ])(props) as React.ReactNode
            }
        </div>
    )
}

type State = {
    fetches: VisualisationProps
}
const mapStateToProps = (state: State) => ({
    userIds: state.fetches.userIds,
    teamName: state.fetches.teamName,
    repo: state.fetches.repo,
    org: state.fetches.org,
})

export default connect(mapStateToProps)(Visualisation)