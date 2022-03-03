import { generateTag } from '../lib/utils/index.js'

describe('utils test suite', () => {
  test('generateTag test case', () => {
    process.chdir('./tests/__demo_workspace__')
    expect(generateTag('awesome-button', 'patch')).toBe('0.0.16')
    expect(generateTag('awesome-button', 'minor')).toBe('0.1.0')
    expect(generateTag('awesome-button', 'major')).toBe('1.0.0')
  })

})