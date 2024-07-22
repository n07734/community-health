import { withStyles, useTheme, CSSProperties } from '@mui/styles'
import {
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material'
import { Theme } from '@mui/material/styles'
import { UserData, UserDataNumbersKeys } from '../../types/State'

import { P, H } from '../shared/StyledTags'

type SelectUserProps = {
    player: string
    color: string
    otherPlayer: string
    setPlayerId: (arg:string) => void
    players: UserData[]
}
const SelectUser = ({
    player = '',
    color,
    otherPlayer,
    setPlayerId,
    players = [],
}: SelectUserProps) => <Select
        value={player}
        style={{
            color,
            fontSize: '2rem',
        }}
        onChange={(e:SelectChangeEvent) => setPlayerId((e.target as HTMLSelectElement).value)}
        inputProps={{ 'aria-label': 'Select a user' }}
    >
    {
        players
            .filter(({ author }) => author !== otherPlayer)
            .map(({ author, name }) => <MenuItem  key={author} value={author} >{name}</MenuItem>)
    }
</Select>

type StatBarsProps = {
    player1: UserData
    player2: UserData
    setPlayer1Id?: (arg:string) => void
    setPlayer2Id?: (arg:string) => void
    players?: UserData[]
    classes: Record<string, string>
}
const StatBars = ({
    player1,
    player2,
    setPlayer1Id = () => ({}),
    setPlayer2Id = () => ({}),
    players = [],
    classes,
}: StatBarsProps) => {
    const theme:Theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const statsKeys:{ title: string, id: UserDataNumbersKeys }[] = [
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
        .filter(({ id }) =>
            Number.isInteger(player1[id]) && Number.isInteger(player2[id])
                && (!['orgCount', 'repoCount'].includes(id)
                    || (['orgCount', 'repoCount'].includes(id) && player1[id] !== 1 && player2[id] !==1)), // don't want these in repo pvp pages
        )
        .map((stat) => {
            const id = stat.id
            const lValue = player1[id]
            const rValue = player2[id]

            const lColor = colorA
            const rColor = colorB

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

    return <div className={classes.root}>
        <div className={classes.title}>
            {
                players.length > 0
                    ? <>
                        <SelectUser
                            player={player1.author}
                            color={colorA}
                            otherPlayer={player2.author}
                            setPlayerId={setPlayer1Id}
                            players={players}
                        />
                        <SelectUser
                            player={player2.author}
                            color={colorB}
                            otherPlayer={player1.author}
                            setPlayerId={setPlayer2Id}
                            players={players}
                        />
                    </>
                    : <>
                        <H level={3} style={{ color:colorA, margin: 0 }}>{player1.name}</H>
                        <H level={3} style={{ color:colorB, margin: 0 }}>{player2.name}</H>
                    </>
            }
        </div>
        {
            stats
                .map((stat, i) => <div key={`${stat.id}${i}`} className={classes.pvpWrapper} style={{ width: '100%'}}>
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
    </div>
}

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = ():TagStyles => ({
    root: {
        width: '100%',
        flexBasis: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        width: '100%',
        maxWidth: '1200px',
        flexWrap: 'nowrap',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1em',
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
        },
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
            left: '8px',
        },
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
            right: '8px',
        },
    },
})

export default withStyles(styles)(StatBars)
