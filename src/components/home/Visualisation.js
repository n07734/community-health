import React from 'react'
import { connect } from 'react-redux'

import RepoView from '../repo/Repo'
import UserView from '../user/User'

const Visualisation = ({ user } = {}) => (
    <div>
        {
            user
                ? <UserView />
                : <RepoView />
        }
    </div>
)

const mapStateToProps = (state) => ({
    user: state.user,
})

export default connect(mapStateToProps)(Visualisation)