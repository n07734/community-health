import { UserData, UserDataNumbersKeys } from '@/types/State'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'


type SelectUserProps = {
    player: string
    className: string
    otherPlayer: string
    setPlayerId: (arg:string) => void
    players: UserData[]
}
const SelectUser = ({
    player = '',
    className = '',
    otherPlayer,
    setPlayerId,
    players = [],
}: SelectUserProps) => <Select
    value={player}
    onValueChange={(value) => setPlayerId(value)}
>
    <SelectTrigger className={`text-3xl w-auto ${className}`}>
        <SelectValue>
            {player}
        </SelectValue>
    </SelectTrigger>
    <SelectContent>
        <SelectGroup>
            {
                players
                    .filter(({ author }) => author !== otherPlayer)
                    .map(({ author, name }) => <SelectItem  key={author} value={author} >{name}</SelectItem>)
            }
        </SelectGroup>
    </SelectContent>
</Select>

type StatBarsProps = {
    player1: UserData
    player2: UserData
    setPlayer1Id?: (arg:string) => void
    setPlayer2Id?: (arg:string) => void
    players?: UserData[]
}
const StatBars = ({
    player1,
    player2,
    setPlayer1Id = () => ({}),
    setPlayer2Id = () => ({}),
    players = [],
}: StatBarsProps) => {
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

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

    return <div className="w-full flex flex-col items-center basis-full">
        <div className="w-full flex flex-nowrap justify-between mb-4 max-w-mw">
            {
                players.length > 0
                    ? <>
                        <SelectUser
                            player={player1.author}
                            className="text-secondary"
                            otherPlayer={player2.author}
                            setPlayerId={setPlayer1Id}
                            players={players}
                        />
                        <SelectUser
                            player={player2.author}
                            className="text-primary"
                            otherPlayer={player1.author}
                            setPlayerId={setPlayer2Id}
                            players={players}
                        />
                    </>
                    : <>
                        <h3 style={{ color:colorA, margin: 0 }}>{player1.name}</h3>
                        <h3 style={{ color:colorB, margin: 0 }}>{player2.name}</h3>
                    </>
            }
        </div>
        {
            stats
                .map((stat, i) => <div key={`${stat.id}${i}`} className="w-full relative max-w-mw mb-2" >
                    <p className="z-[1] absolute w-full top-2 text-center m-0">{stat.title}</p>
                    <div key={stat.id} className="w-full flex flex-nowrap content-stretch justify-between">
                        <div className="relative h-9" style={{
                            width: `${stat.lPercent}%`,
                            backgroundColor: `${stat.lColor}`,
                        }}>
                            <p className="z-[1] min-w-3 w-full absolute top-2 left-2 text-left m-0">{stat.lValue}</p>
                        </div>
                        <div className="relative h-9" style={{
                            width: `${stat.rPercent}%`,
                            backgroundColor: `${stat.rColor}`,
                        }}>
                            <p className="z-[1] min-w-3 w-full absolute top-2 right-2 text-right m-0">{stat.rValue}</p>
                        </div>
                    </div>
                </div>)
        }
    </div>
}

export default StatBars
