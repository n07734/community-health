import { useState } from 'react'
import { withStyles } from '@mui/styles'
import { Delete } from '@mui/icons-material'
import { Theme } from '@mui/material/styles'

import { H } from '../../shared/StyledTags'
import styles from './styles'
import TextInput from './TextInput'
import Button from '../../shared/Button'

const mergedStyles = (theme: Theme) => ({
    ...styles(theme),
    dateRow: {
        gridColumn:'1 / -1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        columnGap: '8px',
        rowGap: '8px',
    },
    modalGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        marginBottom: '2rem',
        columnGap: '8px',
        rowGap: '8px', // BUG: theme.spacing.unit does not have px for row but does for column, odd
        '@media (max-width: 400px)': {
            gridTemplateColumns: 'repeat(1, 1fr)',
        },
        '& button': {
            minHeight: '3rem',
            margin: 0,
            minWidth: 'auto',
        },
        '& .inputDesc' : {
            gridColumn:'1 / -1',
            margin: 0,
        },
    },
    removeDate: {
        minHeight: '3rem',
        backgroundColor: theme.palette.destructive.main,
        color: theme.palette.primary.contrastText,
        borderRadius: '4px',
        padding: '0 0.5rem',
        height: 'auto',
    },
    remove: {
        backgroundColor: theme.palette.destructive.main,
        color: theme.palette.primary.contrastText,
    },
})

type UserFormProps = {
    onSubmit: (users: Users) => void
    gitUsers: string[]
    usersInfo: Users
    classes: any
}
const UserForm = ({
    onSubmit = () => {},
    gitUsers = [],
    usersInfo = {},
    classes = {},
}:UserFormProps) => {

    const userEntries = Object.entries<InitialUserValues>(usersInfo)
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
        const newDates = currentDates.filter((date, index) => index !== dateIndex)
        newUsers[userIndex].dates = newDates
        setUsers(newUsers)
    }

    const [inputError, setInputError] = useState({})

    const membersTitle = gitUsers.length > 0 && 'Edit Github Team members'
        || Object.keys(usersInfo).length > 0 && 'Edit team members'
        || 'Or manually add team members'

    return (
        <form>
            <H level={4}>{ membersTitle }</H>
            {users.map((user, userIndex: number) => (
                <div key={userIndex} className={classes.modalGrid}>
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
                        <div className={classes.dateRow} key={dateIndex}>
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
                                <Delete className={classes.removeDate} onClick={() => handleRemoveDate({userIndex, dateIndex})} />
                        </div>
                    ))}
                    <Button value={`Add ${ user.dates.length > 0 ? 'more dates' : 'dates'}`} color="primary" onClick={(e) => handleAddDates(userIndex,e)} />
                    <Button className={classes.remove} value="Remove User" onClick={(e) => handleRemoveUser(userIndex,e)} />
                </div>
            ))}
            <Button  className={classes.button} value="Create new user" color="primary" onClick={(e) => handleCreateUser(e)} />
            <Button className={classes.button} value="Save and close" color="primary" onClick={(e) => handleSubmit(e)} />
        </form>
    )
}

export default withStyles(mergedStyles)(UserForm)
