import React from 'react'
import { connect } from 'react-redux'

import Paper from '../shared/Paper'
import Button from '../shared/Button'
import { H } from '../shared/StyledTags'


import { setUser as setUserAction } from '../../state/actions'

const UserList = ({
    usersData = [],
    setUser,
} = {}) => <>
    <Paper className="justify">
        <H level={2} >
            User pages
        </H>
        <div>
            {
                usersData
                    .map(({ author }, i) => (
                        <Button
                            value={author}
                            key={i}
                            color="secondary"
                            onClick={(e) => {
                                e.preventDefault()
                                setUser(e.currentTarget.value)
                                window && window.scrollTo(0, 0)
                            }}
                        />
                    ))
            }
        </div>
    </Paper>
</>

const mapDispatchToProps = dispatch => ({
    setUser: (x) => dispatch(setUserAction(x)),
})

export default connect(() => ({}), mapDispatchToProps)(UserList)