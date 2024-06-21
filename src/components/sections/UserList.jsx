
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'

import { useShowNames } from '../../state/ShowNamesProvider'
import Paper from '../shared/Paper'
import Button from '../shared/Button'
import { H } from '../shared/StyledTags'
import { useSubPage } from '../../state/SubPageProvider'

const UserList = ({
    usersData = [],
    classes,
} = {}) => {
    const { showNames } = useShowNames()
    const { togglePvPPage, setUserPage } = useSubPage()

    return usersData.length > 0 && (<>
        <Paper className="justify">
            <Button
                className={classes.fullW}
                value="PvP arena"
                color="primary"
                onClick={(e) => {
                    e.preventDefault()
                    togglePvPPage()
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
                                    setUserPage(user)
                                    window && window.scrollTo(0, 0)
                                }}
                            />
                        ))
                }
            </div>
        </Paper>
    </>)
}

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

export default connect(mapStateToProps)(withStyles(styles)(UserList))