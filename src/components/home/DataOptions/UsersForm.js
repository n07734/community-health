import { useState } from 'react'
import { withStyles } from '@material-ui/core'
import { Delete } from '@material-ui/icons'

import { H } from '../../shared/StyledTags'
import styles from './styles'
import TextInput from './TextInput'
import Button from '../../shared/Button'

const mergedStyles = (theme) => ({
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

const UserForm = ({
    onSubmit = () => {},
    gitUsers = [],
    usersInfo = {},
    classes = {},
}) => {
    console.log('UserForm usersInfo',usersInfo)

    const userEntries = Object.entries(usersInfo)
        .map(([userId, { name = '', dates = []}]) => ({ userId, name, dates }))

    const defaultUsersState = userEntries.length > 0
        ? userEntries
        : [{ userId: '', name: '', dates: [] }]

    const [users, setUsers] = useState(defaultUsersState)

    const handleInputChange = (userIndex) => (field, value) => {
        const newUsers = [...users]
        newUsers[userIndex][field] = value
        console.log('newUsers input', newUsers)
        setUsers(newUsers)
    }

    const handleDateChange = (userIndex, dateIndex) => (field, value) => {
        const newUsers = [...users]
        newUsers[userIndex].dates[dateIndex][field] = value
        console.log('newUsers date', newUsers)
        setUsers(newUsers)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const backToUsersInfo = {}
        users
            .forEach(({ userId, name, dates }) => {
                backToUsersInfo[userId] = { userId, name, dates }
            })
        onSubmit(backToUsersInfo)
    }

    const handleCreateUser = (event) => {
        event.preventDefault()
        setUsers([...users, { userId: '', name: '', dates: [] }])
    }

    const handleRemoveUser = (userIndex, event) => {
        event.preventDefault()
        const newUsers = [...users]
        newUsers.splice(userIndex, 1)
        setUsers(newUsers)
    }

    const handleAddDates = (userIndex, event) => {
        event.preventDefault()
        const newUsers = [...users]
        newUsers[userIndex].dates.push({ startDate: '', endDate: '' })
        setUsers(newUsers)
    }

    const handleRemoveDate = ({ userIndex, dateIndex }) => {
        console.log('User Index:', userIndex)
        console.log('Date Index:', dateIndex)
        const newUsers = [...users]
        console.log('Inputs:', newUsers[userIndex].dates[dateIndex])

        const currentDates = newUsers[userIndex].dates
        const newDates = currentDates.filter((date, index) => index !== dateIndex)
        newUsers[userIndex].dates = newDates
        setUsers(newUsers)
    }

    const [inputError, setInputError] = useState({})
    console.log('users c', users)

    const membersTitle = gitUsers.length > 0 && 'Edit Github Team members'
        || Object.keys(usersInfo).length > 0 && 'Edit team members'
        || 'Or manually add team members'

    return (
        <form>
            <H level={4}>{ membersTitle }</H>
            {users.map((user, userIndex) => (
                <div key={userIndex} className={classes.modalGrid}>
                    <TextInput
                        type="userId"
                        label="User ID"
                        formInfo={user}
                        inputError={inputError}
                        setInputError={setInputError}
                        setValue={handleInputChange(userIndex)}
                    />
                    <TextInput
                        type="name"
                        label="Name"
                        formInfo={user}
                        setValue={handleInputChange(userIndex)}
                        inputError={inputError}
                        setInputError={setInputError}
                    />
                    {user.dates.map((date, dateIndex) => (
                        <div className={classes.dateRow} key={dateIndex}>
                                <TextInput
                                    label="Joined team yyyy/mm/dd"
                                    type="startDate"
                                    formInfo={date}
                                    inputError={inputError}
                                    setInputError={setInputError}
                                    setValue={handleDateChange(userIndex, dateIndex)}
                                />
                                <TextInput
                                    label="Left team yyyy/mm/dd"
                                    type="endDate"
                                    inputError={inputError}
                                    formInfo={date}
                                    setInputError={setInputError}
                                    setValue={handleDateChange(userIndex, dateIndex)}
                                />
                                <Delete className={classes.removeDate} onClick={() => handleRemoveDate({userIndex, dateIndex})} />
                        </div>
                    ))}
                    <Button type="text" value={`Add ${ user.dates.length > 0 ? 'more dates' : 'dates'}`} color="primary" onClick={(e) => handleAddDates(userIndex,e)} />
                    <Button type="text" className={classes.remove} value="Remove User" onClick={(e) => handleRemoveUser(userIndex,e)} />
                </div>
            ))}
            <Button type="text"  className={classes.button} value="Create new user" color="primary" onClick={(e) => handleCreateUser(e)} />
            <Button className={classes.button} value="Save and close" color="primary" type="text" onClick={(e) => handleSubmit(e)} />
        </form>
    )
}

export default withStyles(mergedStyles)(UserForm)
