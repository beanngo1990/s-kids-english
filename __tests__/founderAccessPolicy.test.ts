import { evaluateFounderAccess } from '../src/engine/FounderAccessPolicy';

const cutoffAt = '2026-07-10T00:00:00.000Z';
const durationDays = 365;
const beforeExpiration = Date.parse('2027-07-08T23:59:59.999Z');

describe('Founder access policy', () => {
  test.each([
    ['before cutoff', '2026-07-09T23:59:59.999Z'],
    ['exactly at cutoff', cutoffAt],
  ])('accepts firstSeen %s', (_label, firstSeen) => {
    const result = evaluateFounderAccess(
      makeCustomerInfo(firstSeen),
      { cutoffAt, durationDays },
      Date.parse('2026-07-11T00:00:00.000Z'),
    );

    expect(result).toMatchObject({
      isActive: true,
      isEligible: true,
      status: 'active',
    });
  });

  test('rejects a customer first seen after the cutoff', () => {
    expect(
      evaluateFounderAccess(
        makeCustomerInfo('2026-07-10T00:00:00.001Z'),
        { cutoffAt, durationDays },
        Date.parse('2026-07-11T00:00:00.000Z'),
      ),
    ).toEqual({
      isActive: false,
      isEligible: false,
      status: 'afterCutoff',
    });
  });

  test.each([
    ['one millisecond before expiration', beforeExpiration, true],
    [
      'exactly at expiration',
      Date.parse('2027-07-09T00:00:00.000Z'),
      false,
    ],
    [
      'after expiration',
      Date.parse('2027-07-09T00:00:00.001Z'),
      false,
    ],
  ])('%s has the expected active state', (_label, now, expectedActive) => {
    const result = evaluateFounderAccess(
      makeCustomerInfo('2026-07-09T00:00:00.000Z'),
      { cutoffAt, durationDays },
      now as number,
    );

    expect(result.isActive).toBe(expectedActive);
    expect(result.expirationDate).toBe('2027-07-09T00:00:00.000Z');
    expect(result.status).toBe(expectedActive ? 'active' : 'expired');
  });

  test('uses RevenueCat requestDate as a lower bound against clock rollback', () => {
    const result = evaluateFounderAccess(
      {
        firstSeen: '2026-07-09T00:00:00.000Z',
        requestDate: '2027-07-09T00:00:00.000Z',
      },
      { cutoffAt, durationDays },
      Date.parse('2026-07-09T00:00:00.000Z'),
    );

    expect(result.status).toBe('expired');
    expect(result.isActive).toBe(false);
  });

  test.each([
    ['empty cutoff', { cutoffAt: '', durationDays }],
    [
      'cutoff without timezone',
      { cutoffAt: '2026-07-10T00:00:00', durationDays },
    ],
    [
      'invalid calendar date',
      { cutoffAt: '2026-02-30T00:00:00.000Z', durationDays },
    ],
    ['zero duration', { cutoffAt, durationDays: 0 }],
    ['fractional duration', { cutoffAt, durationDays: 365.5 }],
    ['excessive duration', { cutoffAt, durationDays: 3651 }],
  ])('fails closed for %s', (_label, config) => {
    expect(
      evaluateFounderAccess(
        makeCustomerInfo('2026-07-09T00:00:00.000Z'),
        config,
        Date.parse('2026-07-11T00:00:00.000Z'),
      ).isActive,
    ).toBe(false);
  });

  test.each([
    [
      'invalid firstSeen',
      { firstSeen: 'not-a-date', requestDate: '2026-07-11T00:00:00.000Z' },
    ],
    [
      'invalid requestDate',
      { firstSeen: '2026-07-09T00:00:00.000Z', requestDate: 'not-a-date' },
    ],
    [
      'firstSeen later than requestDate',
      {
        firstSeen: '2026-07-09T00:00:00.000Z',
        requestDate: '2026-07-08T00:00:00.000Z',
      },
    ],
  ])('fails closed for %s', (_label, customerInfo) => {
    expect(
      evaluateFounderAccess(
        customerInfo,
        { cutoffAt, durationDays },
        Date.parse('2026-07-11T00:00:00.000Z'),
      ),
    ).toEqual({
      isActive: false,
      isEligible: false,
      status: 'invalid',
    });
  });
});

function makeCustomerInfo(firstSeen: string) {
  return {
    firstSeen,
    requestDate: '2026-07-11T00:00:00.000Z',
  };
}
