import type { Context } from './context';
import { HttpOptions } from './http-options';
import { post } from './request';
import { suffixSlash, resolveUrl } from './url-utils';
import * as murmurHash3 from 'murmurhash3js';

export function createSendFeedback(
  url: string,
  appName: string,
  instanceId: string,
  headers?: Record<string, string>,
  timeout?: number,
  httpOptions?: HttpOptions,
) {
  return async (
    featureName: string,
    payload: number,
    context: Context = {},
    metadata?: object,
  ): Promise<void> => {
    try {
      let contextHash: string | undefined;
      if (context.userId) {
        // FIXME: safe hashing function
        contextHash = murmurHash3.x64.hash128(context.userId, 31);
      } else if (context.sessionId) {
        contextHash = murmurHash3.x64.hash128(context.sessionId, 31);
      }

      const json = {
        featureName,
        contextHash,
        payload,
        metadata,
      };

      const res = await post({
        url: resolveUrl(suffixSlash(url), './client/feedback'),
        json,
        appName: appName,
        instanceId,
        headers,
        timeout,
        httpOptions,
      });

      if (res.status === 404) {
        console.error('404');
      }
      if (!res.ok) {
        console.error(`${url} returning ${res.status}`, await res.text());
        // TODO: emitter
      } else {
        // emit(UnleashEvents.Sent, payload);
        console.log('SENT!');
      }
    } catch (err) {
      console.error(err);
      // TODO: emitter
    }
  };
}
