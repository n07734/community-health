import { useState } from 'react'
import { Users, UserValues } from '../../../types/Components' // TODO: Consolidate UserValues and UserInfo
import { UsersInfo, UserInfo } from '../../../types/State'

import TextInput from './TextInput'
import { Button } from '@/components/ui/button'

type UsersFormProps = {
    onSubmit: (users: Users) => void
    gitUsers: UserInfo[]
    usersInfo: UsersInfo
}
const UsersForm = ({
    onSubmit = () => {},
    gitUsers = [],
    usersInfo = {},
}:UsersFormProps) => {

    const userEntries = Object.entries(usersInfo)
        .map(([userId, { name = '', dates = []}]) => ({ userId, name, dates }))

    const defaultUsersState: UserValues[] = userEntries.length > 0
        ? userEntries
        : [{ userId: '', name: '', dates: [] }]

    const [users, setUsers] = useState(defaultUsersState)

    type UserFields = 'userId' | 'name'
    const handleInputChange = (userIndex: number) => (field: UserFields, value: string) => {
        const newUsers: UserValues[] = [...users]
        newUsers[userIndex][field] = value
        setUsers(newUsers)
    }

    type DateFields = 'startDate' | 'endDate'
    const handleDateChange = (userIndex: number, dateIndex: number) => (field: DateFields, value: string) => {
        const newUsers: UserValues[] = [...users]
        newUsers[userIndex].dates[dateIndex][field] = value
        setUsers(newUsers)
    }

    const handleSubmit = (event:React.FormEvent<HTMLElement>) => {
        event.preventDefault()
        const backToUsersInfo:Users = {}
        users
            .forEach(({ userId, name, dates }:UserValues) => {
                backToUsersInfo[userId] = { userId, name, dates }
            })
        onSubmit(backToUsersInfo)
    }

    const handleCreateUser = (event:React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        setUsers([...users, { userId: '', name: '', dates: [] }])
    }

    const handleRemoveUser = (userIndex: number, event:React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        const newUsers = [...users]
        newUsers.splice(userIndex, 1)
        setUsers(newUsers)
    }

    const handleAddDates = (userIndex: number, event:React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        const newUsers = [...users]
        const blankDates = { startDate: '', endDate: '' }
        newUsers[userIndex].dates.push(blankDates)
        setUsers(newUsers)
    }

    type RemoveDate = {
        userIndex: number
        dateIndex: number
    }
    const handleRemoveDate = ({ userIndex , dateIndex }:RemoveDate) => {
        const newUsers = [...users]

        const currentDates = newUsers[userIndex].dates
        const newDates = currentDates.filter((_date, index) => index !== dateIndex)
        newUsers[userIndex].dates = newDates
        setUsers(newUsers)
    }

    const [inputError, setInputError] = useState({})

    const membersTitle = gitUsers.length > 0 && 'Edit Github Team members'
        || Object.keys(usersInfo).length > 0 && 'Edit team members'
        || 'Or manually add team members'

    return (
        <form>
            <h4>{ membersTitle }</h4>
            {users.map((user, userIndex: number) => (
                <div key={userIndex} className="grid grid-cols-1 gap-2 max-mm:grid-cols-2 mb-8">
                    <TextInput
                        type="userId"
                        formInfo={user}
                        inputError={inputError}
                        setInputError={setInputError}
                        setValue={handleInputChange(userIndex)}
                    />
                    <TextInput
                        type="name"
                        formInfo={user}
                        setValue={handleInputChange(userIndex)}
                        inputError={inputError}
                        setInputError={setInputError}
                    />
                    {user.dates.map((date, dateIndex) => (
                        <div className="flex items-stretch gap-2 justify-between col-span-full" key={dateIndex}>
                            <TextInput
                                type="startDate"
                                formInfo={date}
                                inputError={inputError}
                                setInputError={setInputError}
                                setValue={handleDateChange(userIndex, dateIndex)}
                            />
                            <TextInput
                                type="endDate"
                                inputError={inputError}
                                formInfo={date}
                                setInputError={setInputError}
                                setValue={handleDateChange(userIndex, dateIndex)}
                            />
                            <svg
                                onClick={() => handleRemoveDate({userIndex, dateIndex})}
                                className="w-6 fill-current min-h-12 rounded-sm bg-destructive test-[#CCC] px-0 py-2 h-auto"
                                focusable="false"
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                data-testid="DeleteIcon"
                            >
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"></path>
                            </svg>
                        </div>
                    ))}
                    <Button
                        className="min-h-12 m-0"
                        color="primary"
                        onClick={(e: React.MouseEvent<HTMLElement>) => handleAddDates(userIndex,e)}
                    >
                        {`Add ${ user.dates.length > 0 ? 'more dates' : 'dates'}`}
                    </Button>
                    <Button
                        className="bg-destructive text=[#CCC] min-h-12 m-0"
                        onClick={(e: React.MouseEvent<HTMLElement>) => handleRemoveUser(userIndex,e)}
                    >
                        Remove User
                    </Button>
                </div>
            ))}
            <Button
                className="mr-0 w-full min-h-12"
                color="primary"
                onClick={(e) => handleCreateUser(e)}
            >
                Create new user
            </Button>
            <Button
                className="mr-0 w-full min-h-12"
                color="primary"
                onClick={(e) => handleSubmit(e)}
            >
                Save and close
            </Button>
        </form>
    )
}

export default UsersForm
