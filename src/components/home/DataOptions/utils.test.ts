
import { validate } from './utils'

describe('validate: userIds key', () => {
    test.each([
        [ 'gitTeamUrl', 'https://abc.com', true],
        [ 'gitTeamUrl', 'http://abc.com', false],
        [ 'enterpriseAPI', 'https://abc.com', true],
        [ 'excludeIds', '123,abc', true],
        [ 'events', 'abc=123', true],
        [ 'startDate', '2024-10-01', true],
        [ 'startDate', '2024-10-1', false],
        [ 'usersInfo', { userName: 'user' }, true],
        [ 'usersInfo', {}, false],
      ])('input %s', (key, value, expected) => {
        const result = validate({ key, value} as any)

        expect(result).toEqual(expected)
      })
})
