import formatChordData from './chordData'

describe('formatChordData:', () => {
    it('Five users with equal contributions', () => {
        const data = [
            {
                author: 'one',
                commentsByUser: {
                    two: 10,
                    three: 10,
                    four: 10,
                    five: 10,
                },
            },
            {
                author: 'two',
                commentsByUser: {
                    one: 10,
                    three: 10,
                    four: 10,
                    five: 10,
                },
            },
            {
                author: 'three',
                commentsByUser: {
                    one: 10,
                    two: 10,
                    four: 10,
                    five: 10,
                },
            },
            {
                author: 'four',
                commentsByUser: {
                    one: 10,
                    two: 10,
                    three: 10,
                    five: 10,
                },
            },
            {
                author: 'five',
                commentsByUser: {
                    one: 10,
                    two: 10,
                    three: 10,
                    four: 10,
                },
            },
        ]

        const args:{
            data:any
            dataKey:any
        } = {
            data,
            dataKey:'commentsByUser',
        }
        const result = formatChordData(args)

        expect(result).toMatchSnapshot()
    })

    it('Two users role into "other" due to low contributions', () => {
        const data = [
            {
                author: 'one',
                commentsByUser: {
                    two: 1,
                    three: 0,
                    four: 0,
                    five: 1,
                },
            },
            {
                author: 'two',
                commentsByUser: {
                    one: 1,
                    three: 0,
                    four: 0,
                    five: 1,
                },
            },
            {
                author: 'three',
                commentsByUser: {
                    one: 0,
                    two: 0,
                    four: 0,
                    five: 0,
                },
            },
            {
                author: 'four',
                commentsByUser: {
                    one: 0,
                    two: 0,
                    three: 0,
                    five: 10,
                },
            },
            {
                author: 'five',
                commentsByUser: {
                    one: 0,
                    two: 0,
                    three: 0,
                    four: 0,
                },
            },
        ]

        const args:{
            data:any
            dataKey:any
        } = {
            data,
            dataKey:'commentsByUser',
        }
        const { names } = formatChordData(args)

        expect(names.length).toEqual(4)
        expect(names.find(x => x === 'Others')).toEqual('Others')
    })


    it('Only one low contributor does not role into "Other"', () => {
        const data = [
            {
                author: 'one',
                commentsByUser: {
                    two: 1,
                    three: 1,
                    four: 1,
                    five: 1,
                },
            },
            {
                author: 'two',
                commentsByUser: {
                    one: 0,
                    three: 10,
                    four: 10,
                    five: 10,
                },
            },
            {
                author: 'three',
                commentsByUser: {
                    one: 0,
                    two: 10,
                    four: 10,
                    five: 10,
                },
            },
            {
                author: 'four',
                commentsByUser: {
                    one: 0,
                    two: 10,
                    three: 10,
                    five: 10,
                },
            },
            {
                author: 'five',
                commentsByUser: {
                    one: 0,
                    two: 10,
                    three: 10,
                    four: 10,
                },
            },
        ]

        const args:{
            data:any
            dataKey:any
        } = {
            data,
            dataKey:'commentsByUser',
        }
        const { names } = formatChordData(args)

        expect(names.length).toEqual(5)
        expect(names.every(x => x !== 'Other')).toEqual(true)
    })
})