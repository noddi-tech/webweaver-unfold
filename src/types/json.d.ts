// Type declarations for JSON imports
// Allows importing JSON data like GitHub emoji shortcodes without TS errors
declare module "emojibase-data/en/shortcodes/github.json" {
  const data: Record<string, string | string[]>;
  export default data;
}

declare module "*.json" {
  const value: any;
  export default value;
}
