import { withStyles } from '@material-ui/core/styles'
import {
    Select,
    MenuItem,
} from '@material-ui/core'

import { P, H } from '../shared/StyledTags'

const colourA = '#1f77b4'
const colourB = '#e82573'

const SelectUser = (props = {}) => {
    const {
        setUser,
        user = '',
        color,
        otherUser,
        users = [],
    } = props

    return <Select
            value={user}
            style={{
                color,
                fontSize: '2rem'
            }}

            onChange={(e) => setUser(e.target.value)}
            inputProps={{ 'aria-label': 'Select a user' }}
        >
        {
            users
                .filter(user => user !== otherUser)
                .map(user => <MenuItem  key={user} value={user} >{user}</MenuItem>)
        }
    </Select>
}

const StatBars = ({
    user1 = {},
    user2 = {},
    users = [],
    setUser1,
    setUser2,
    classes,
} = {}) => {
    const statsKeys = [
        {
            title: 'Total Merged',
            id: 'totalPRs',
        },
        {
            title: 'Total approved',
            id: 'uniquePRsApproved',
        },
        {
            title: 'Comments given',
            id: 'commentsGiven',
        },
        {
            title: 'Comments received',
            id: 'commentsReceived',
        },
        // {
        //     title: 'Total positive sentiment',
        //     id: 'sentimentTotalPositiveScore',
        // },
        // {
        //     title: 'Total negative sentiment',
        //     id: 'sentimentTotalNegativeScore',
        // },
        {
            title: 'Average positive sentiment',
            id: 'sentimentAveragePositiveScore',
        },
        {
            title: 'Average negative sentiment',
            id: 'sentimentAverageNegativeScore',
        },
        {
            title: 'Average size',
            id: 'prSize',
        },
        {
            title: 'Total additions',
            id: 'prTotalAdditions',
        },
        {
            title: 'Total deletions',
            id: 'prTotalDeletions',
        },
        {
            title: 'Average days open',
            id: 'age',
        },
        {
            title: 'Orgs contributed to',
            id: 'orgCount',
        },
        {
            title: 'Repos contributed to',
            id: 'repoCount',
        },
    ]

    const stats = statsKeys
        .filter(({ id } = {}) =>
            Number.isInteger(user1[id]) && Number.isInteger(user2[id])
                && (!['orgCount', 'repoCount'].includes(id)
                    || (['orgCount', 'repoCount'].includes(id) && user1[id] !== 1 && user2[id] !==1)) // don't want these in repo pvp pages
        )
        .map((stat = {}) => {
            const id = stat.id
            const lValue = user1[id]
            const rValue = user2[id]

            const lColor = colourA
            const rColor = colourB

            const lPercent = Math.ceil((100 *  lValue) / (lValue + rValue))
            const rPercent = 100 - lPercent

            return {
                ...stat,
                lValue,
                lColor,
                lPercent,
                rValue,
                rColor,
                rPercent,
            }
        })

    return <>
        <div className={classes.title}>
            {
                users.length > 0
                    ? <>
                        <SelectUser
                            user={user1.user}
                            color={colourA}
                            otherUser={user2.user}
                            setUser={setUser1}
                            users={users}
                        />
                        <SelectUser
                            user={user2.user}
                            color={colourB}
                            otherUser={user1.user}
                            setUser={setUser2}
                            users={users}
                        />
                    </>
                    : <>
                        <H level={3} style={{ color:colourA, margin: 0 }}>{user1.user}</H>
                        <H level={3} style={{ color:colourB, margin: 0 }}>{user2.user}</H>
                    </>
            }
        </div>
        {
            stats
                .map((stat = {}, i) => <div key={`${stat.id}${i}`} className={classes.pvpWrapper} style={{ width: '100%'}}>
                    <P>{stat.title}</P>
                    <div key={stat.id} className={classes.pvpBarWrapper}>
                        <div className={classes.pvpL} style={{
                            width: `${stat.lPercent}%`,
                            backgroundColor: `${stat.lColor}`,
                        }}>
                            <P>{stat.lValue}</P>
                        </div>
                        <div className={classes.pvpR} style={{
                            width: `${stat.rPercent}%`,
                            backgroundColor: `${stat.rColor}`,
                        }}>
                            <P>{stat.rValue}</P>
                        </div>
                    </div>
                </div>)
        }
    </>
}

const styles = theme => ({
    title: {
        width: '100%',
        maxWidth: '1200px',
        flexWrap: 'nowrap',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1em'
    },
    pvpWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        marginBottom: '1em',
        '& > p': {
            zIndex: 1,
            position: 'absolute',
            width: '100%',
            top: '8px',
            textAlign: 'center',
            margin: '0',
        }
    },
    pvpBarWrapper: {
        width: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        alignContent: 'stretch',
        justifyContent: 'space-between',
    },
    pvpL: {
        position: 'relative',
        textAlign: 'left',
        height: '2.2rem',
        '& p': {
            zIndex: 1,
            margin: 0,
            position: 'absolute',
            top: '8px',
            left: '8px'
        }
    },
    pvpR: {
        position: 'relative',
        textAlign: 'right',
        height: '2.2rem',
        '& p': {
            zIndex: 1,
            margin: 0,
            position: 'absolute',
            top: '8px',
            right: '8px'
        }
    },
})

export default withStyles(styles)(StatBars)
