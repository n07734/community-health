
import { validate } from './utils'

describe('validate: userIds key', () => {
    test.each([
        [ '', false],
        [ 'userName', true],
        [ 'userName1, userName2', true],
        [
            'userName1=end:2023-12-12,userName2=start:2020-12-12',
            true
        ],
        [
            'userName4=start:2020-12-12;end:2021|start:2022-12-12,userName5',
            true
        ],
        [
            'userName4=start:2020-12-12;end:2021|start:2019-12-12',
            false
        ],
        [
            'userName9=start:2020-12-12;end:0-0',
            false
        ],
      ])('input %s', (value, expected) => {
        const result = validate({ key: 'userIds', value})

        expect(result).toEqual(expected)
      })
})
