declare module "twemoji" {
  export type TwemojiParseOptions = {
    base?: string;
    folder?: string;
    ext?: string;
    className?: string;
    callback?: (icon: string, options?: TwemojiParseOptions) => string | false;
    attributes?: (icon: string, variant?: string) => Record<string, string>;
  };

  const twemoji: {
    parse(input: string, options?: TwemojiParseOptions): string;
    parse(input: HTMLElement, options?: TwemojiParseOptions): HTMLElement;
  };

  export default twemoji;
}
