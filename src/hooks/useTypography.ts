// Typography hook for consistent heading and text styles across the application

export const useTypography = () => ({
  h1: "text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight",
  h2: "text-4xl md:text-5xl font-bold leading-snug",
  h3: "text-3xl md:text-4xl font-bold leading-snug",
  h4: "text-2xl md:text-3xl font-semibold leading-normal",
  body: "text-lg md:text-xl leading-relaxed",
  caption: "text-sm md:text-base text-muted-foreground",
});
