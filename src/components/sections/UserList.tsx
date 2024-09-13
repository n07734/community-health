
import { connect } from 'react-redux'


import { UserData } from '@/types/State'

import { useShowNames } from '@/state/ShowNamesProvider'
import { useSubPage } from '@/state/SubPageProvider'

import Paper from '@/components/shared/Paper'
import { Button } from '@/components/ui/button'

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
                className="w-full mb-4"
                color="primary"
                onClick={(e) => {
                    e.preventDefault()
                    togglePvPPage()
                    window && window.scrollTo(0, 0)
                }}
            >
                PvP arena
            </Button>
            <h3 className="w-full">
                User pages
            </h3>
            <div className="flex flex-wrap justify-between gap-2">
                {
                    usersData
                        .map(({ author, user }, i) => (
                            <Button
                                className='flex-grow'
                                key={`${i}`}
                                variant="secondary"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setUserPage(user)
                                    window && window.scrollTo(0, 0)
                                }}
                            >
                                {showNames ? author : 'Spartacus'}
                            </Button>
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