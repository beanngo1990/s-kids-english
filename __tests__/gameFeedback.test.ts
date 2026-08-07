import { runGameMatchCallback } from '../src/games/useGameFeedback';

describe('runGameMatchCallback', () => {
  it('swallows synchronous persistence failures', async () => {
    const onMatch = jest.fn(() => {
      throw new Error('storage unavailable');
    });

    await expect(
      runGameMatchCallback(onMatch, 'vocab-swing', true),
    ).resolves.toBeUndefined();
    expect(onMatch).toHaveBeenCalledWith('vocab-swing', true);
  });

  it('swallows asynchronous persistence failures', async () => {
    const onMatch = jest.fn(() => Promise.reject(new Error('write failed')));

    await expect(
      runGameMatchCallback(onMatch, 'vocab-slide', false),
    ).resolves.toBeUndefined();
    expect(onMatch).toHaveBeenCalledWith('vocab-slide', false);
  });
});
