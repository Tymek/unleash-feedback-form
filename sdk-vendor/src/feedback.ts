import { Context } from './context';
import { HttpOptions } from './http-options';
import { post } from './request';
import { suffixSlash, resolveUrl } from './url-utils';

export function createSendFeedback(
  url: string,
  appName: string,
  instanceId: string,
  headers?: Record<string, string>,
  timeout?: number,
  httpOptions?: HttpOptions,
) {
  return async (toggleName: string, payload: number, context: Context = {}): Promise<void> => {
    try {
      const res = await post({
        url: resolveUrl(suffixSlash(url), './client/feedback'),
        json: { toggleName, payload, context },
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
