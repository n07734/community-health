import { slimObject } from './lightenData'

describe('lightenData:', () => {
    it('remove non values', () => {
        const result = slimObject({
            no1: 0,
            no2: '',
            no3: {},
            no4: null,
            no5: [],
            no6: {
                no61: '',
            },
            no7: false,
            no8: undefined,
            no9: [undefined, 0, ''],
            yes1: 1,
            yes2: 'two',
            mix1: [1, 0, { a:1, b:false },'four', {}],
            mix2: {
                n1: 0,
                m1: [1,0, true]
            },
        })

        expect(result).toEqual({
            mix1: [1, {a: 1}, 'four'],
            mix2: {'m1': [1, true]},
            yes1: 1,
            yes2: 'two'
        })
    })
})