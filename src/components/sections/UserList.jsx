
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import { useShowNames } from '../../state/ShowNamesProvider'
import Paper from '../shared/Paper'
import Button from '../shared/Button'
import { H } from '../shared/StyledTags'

import {
    setUser as setUserAction,
    setPvP as setPvPAction,
} from '../../state/actions'

const UserList = ({
    usersData = [],
    setUser,
    setPvP,
    classes,
} = {}) => {
    const { showNames } = useShowNames()

    return usersData.length > 0 && (<>
        <Paper className="justify">
            <Button
                className={classes.fullW}
                value="PvP arena"
                color="primary"
                onClick={(e) => {
                    e.preventDefault()
                    setPvP()
                    window && window.scrollTo(0, 0)
                }}
            />
            <H level={2} className={classes.fullW}>
                User pages
            </H>
            <div className={classes.allButons}>
                {
                    usersData
                        .map(({ author, user }, i) => (
                            <Button
                                value={showNames ? author : 'Spartacus'}
                                key={i}
                                color="secondary"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setUser(user)
                                    window && window.scrollTo(0, 0)
                                }}
                            />
                        ))
                }
            </div>
        </Paper>
    </>)
}

const mapDispatchToProps = dispatch => ({
    setUser: (x) => dispatch(setUserAction(x)),
    setPvP: (x) => dispatch(setPvPAction(x)),
})

const styles = () => ({
    'allButons': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        '& button': {
            flexGrow: 1,
        },
    },
    'fullW': {
        width: '100%',
    },
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserList))