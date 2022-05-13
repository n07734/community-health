import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Paper from '../shared/Paper'
import Button from '../shared/Button'
import { H } from '../shared/StyledTags'


import { setUser as setUserAction } from '../../state/actions'

const UserList = ({
    usersData = [],
    setUser,
    classes,
} = {}) => <>
    <Paper className="justify">
        <H level={2} className={classes.fullW}>
            User pages
        </H>
        <div className={classes.allButons}>
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

const styles = theme => ({
    'allButons': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        '& button': {
            flexGrow: 1
        }
    },
    'fullW': {
        width: '100%',
    },
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserList))