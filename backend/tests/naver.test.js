import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

process.env.NAVER_CLIENT_ID = 'test-client-id';
process.env.NAVER_CLIENT_SECRET = 'test-client-secret';

const require = createRequire(import.meta.url);
const axios = require('axios');
const { getTrendingKeywords, getRecommendedItems } = require('../services/naver');

function okResponse(ratio = 50) {
  return { data: { results: [{ data: [{ period: '2026-01-01', ratio }] }] } };
}

function httpError(status) {
  const err = new Error(`Request failed with status code ${status}`);
  err.response = { status, data: { errorMessage: `http ${status}` } };
  return err;
}

function timeoutError() {
  const err = new Error('timeout of 8000ms exceeded');
  err.code = 'ECONNABORTED';
  return err;
}

let postSpy;

beforeEach(() => {
  vi.useFakeTimers();
  postSpy = vi.spyOn(axios, 'post');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('getTrendingKeywords 재시도', () => {
  it('첫 호출 성공이면 axios.post 1번만 호출', async () => {
    postSpy.mockResolvedValueOnce(okResponse(70));

    const promise = getTrendingKeywords('키워드');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ date: '2026-01-01', ratio: 70, keyword: '키워드' }]);
  });

  it('타임아웃 오류(error.response 없음) 후 성공이면 2번 호출', async () => {
    postSpy.mockRejectedValueOnce(timeoutError()).mockResolvedValueOnce(okResponse(60));

    const promise = getTrendingKeywords('키워드');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(result[0].ratio).toBe(60);
  });

  it('429 후 성공이면 2번 호출', async () => {
    postSpy.mockRejectedValueOnce(httpError(429)).mockResolvedValueOnce(okResponse(55));

    const promise = getTrendingKeywords('키워드');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(result[0].ratio).toBe(55);
  });

  it('500대 오류 후 성공이면 2번 호출', async () => {
    postSpy.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(okResponse(45));

    const promise = getTrendingKeywords('키워드');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(result[0].ratio).toBe(45);
  });

  it('400 같은 재시도 대상이 아닌 오류는 1번만 호출하고 오류를 던짐', async () => {
    postSpy.mockRejectedValue(httpError(400));

    const assertion = expect(getTrendingKeywords('키워드')).rejects.toThrow('http 400');
    await vi.runAllTimersAsync();
    await assertion;

    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('재시도도 실패하면 총 2번 호출 후 오류를 던짐', async () => {
    postSpy.mockRejectedValue(httpError(500));

    const assertion = expect(getTrendingKeywords('키워드')).rejects.toThrow('http 500');
    await vi.runAllTimersAsync();
    await assertion;

    expect(postSpy).toHaveBeenCalledTimes(2);
  });
});

describe('getRecommendedItems 키워드 실패 처리', () => {
  beforeEach(() => {
    // keywordGroups[0].groupName 으로 키워드를 구분. 'bad'는 400(재시도 없음)으로 실패
    postSpy.mockImplementation(async (url, body) => {
      const name = body.keywordGroups[0].groupName;
      if (name === 'bad') throw httpError(400);
      return okResponse(name === 'a' ? 30 : 80);
    });
  });

  it('일부 키워드가 실패해도 나머지는 조회되고 analyzedCount는 성공한 개수와 같음', async () => {
    const promise = getRecommendedItems(['a', 'bad', 'c']);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postSpy).toHaveBeenCalledTimes(3);
    expect(result.analyzedCount).toBe(2);
    expect(result.items).toHaveLength(3);
  });

  it('실패한 키워드는 빈 배열로 처리되어 searchTrend 0이 됨', async () => {
    const promise = getRecommendedItems(['a', 'bad', 'c']);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postSpy).toHaveBeenCalledTimes(3);
    expect(result.items.find(i => i.keyword === 'bad').searchTrend).toBe(0);
    expect(result.items.find(i => i.keyword === 'a').searchTrend).toBe(30);
    expect(result.items.find(i => i.keyword === 'c').searchTrend).toBe(80);
  });
});
