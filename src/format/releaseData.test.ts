import { formatReleaseData } from './releaseData'

describe('formatReleaseData:', () => {
    it('correct versioning and date sorting', () => {
        const data:any[] = [
            { description: 'v0.0.1', date: '2020-10-30' },
            { description: 'v0.2.0', date: '2020-10-29' },
            { description: 'v0.2.1', date: '2020-10-28' },
            { description: 'v5.3.0', date: '2020-10-20' },
            { description: 'v1.3.0', date: '2020-10-19' },
            { description: 'v1.3.1', date: '2020-10-18' },
            { description: 'v2.0.0', date: '2020-10-15' },
            { description: '3.0.0', date: '2020-10-10T21:26:18Z' },
        ]

        const result = formatReleaseData(data)

        expect(result).toStrictEqual([
            {
                date: '2020-10-10',
                description: '3.0.0',
                releaseType: 'MAJOR',
            },
            {
                date: '2020-10-15',
                description: 'v2.0.0',
                releaseType: 'MAJOR',
            },
            {
                date: '2020-10-18',
                description: 'v1.3.1',
                releaseType: 'PATCH',
            },
            {
                date: '2020-10-19',
                description: 'v1.3.0',
                releaseType: 'MAJOR',
            },
            {
                date: '2020-10-20',
                description: 'v5.3.0',
                releaseType: 'MAJOR',
            },
            {
                date: '2020-10-28',
                description: 'v0.2.1',
                releaseType: 'PATCH',
            },
            {
                date: '2020-10-29',
                description: 'v0.2.0',
                releaseType: 'MINOR',
            },
            {
                date: '2020-10-30',
                description: 'v0.0.1',
                releaseType: 'PATCH',
            },
        ])
    })

    it('ignore invalid tags', () => {
        const data:any[] = [
            { description: 'v0.0.1', date: '2020-10-30' },
            { description: 'v0.2.UU', date: '2020-10-29' },
            { description: 'v0.3.0', date: '2020-10-20' },
        ]

        const result = formatReleaseData(data)

        expect(result).toStrictEqual([
            {
                date: '2020-10-20',
                description: 'v0.3.0',
                releaseType: 'MINOR',
            },
            {
                date: '2020-10-30',
                description: 'v0.0.1',
                releaseType: 'PATCH',
            },
        ])
    })
})