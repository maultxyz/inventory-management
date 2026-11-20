declare const __APP_VERSION__: string;
declare const __BUILD_ID__: string;

interface Window {
  __ENV__?: Partial<Record<string, string>>;
}
