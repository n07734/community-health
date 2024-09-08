
import { connect } from 'react-redux'


import { UserData } from '@/types/State'

import { useShowNames } from '@/state/ShowNamesProvider'
import { useSubPage } from '@/state/SubPageProvider'

import Paper from '@/components/shared/Paper'
import Button from '@/components/shared/Button'

type UserListProps = {
    usersData: UserData[]
}
const UserList = ({
    usersData = [],
}: UserListProps) => {
    const { showNames } = useShowNames()
    const { togglePvPPage, setUserPage } = useSubPage()

    return usersData.length > 0 && (<>
        <Paper className="justify-between">
            <Button
                className="w-full"
                value="PvP arena"
                color="primary"
                onClick={(e) => {
                    e.preventDefault()
                    togglePvPPage()
                    window && window.scrollTo(0, 0)
                }}
            />
            <h3 className="w-full">
                User pages
            </h3>
            <div className="flex flex-wrap justify-between">
                {
                    usersData
                        .map(({ author, user }, i) => (
                            <Button
                                className='flex-grow'
                                value={showNames ? author : 'Spartacus'}
                                key={`${i}`}
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

type State = {
    usersData: UserData[]
}
const mapStateToProps = (state:State) => ({
    usersData: state.usersData,
})

export default connect(mapStateToProps)(UserList)