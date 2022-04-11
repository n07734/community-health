import React from 'react'
import { connect } from 'react-redux'
import {
    cond,
    always,
    propSatisfies,
    T as alwaysTrue,
} from 'ramda'
import RepoView from '../repo/Repo'
import UserView from '../user/User'
import TeamView from '../team/Team'

const Visualisation = (props) => (
    <div>
        {
            cond([
                [propSatisfies(Boolean, 'user'), always(<UserView />)],
                [propSatisfies(Boolean, 'teamName'), always(<TeamView />)],
                [alwaysTrue, always(<RepoView />)],
            ])(props)
        }
    </div>
)

const mapStateToProps = (state) => ({
    user: state.user,
    teamName: state.teamName || 'core',
})

export default connect(mapStateToProps)(Visualisation)