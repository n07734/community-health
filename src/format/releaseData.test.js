import releaseData from './releaseData'

describe('releaseData:', () => {
    it('correct versioning and date sorting', () => {
        const data = [
            { description: 'v0.0.1', date: '2020-10-30' },
            { description: 'v0.2.0', date: '2020-10-29' },
            { description: 'v0.2.1', date: '2020-10-28' },
            { description: 'v5.3.0', date: '2020-10-20' },
            { description: 'v1.3.0', date: '2020-10-19' },
            { description: 'v1.3.1', date: '2020-10-18' },
            { description: 'v2.0.0', date: '2020-10-15' },
            { description: 'v3.0.0', date: '2020-10-10' },
        ]

        const result = releaseData(data)

        expect(result).toMatchSnapshot()
    })

    it('ignore invalid tags', () => {
        const data = [
            { description: 'v0.0.1', date: '2020-10-30' },
            { description: 'v0.2.UU', date: '2020-10-29' },
            { description: 'v0.3.0', date: '2020-10-20' },
        ]

        const result = releaseData(data)

        expect(result).toMatchSnapshot()
    })
})