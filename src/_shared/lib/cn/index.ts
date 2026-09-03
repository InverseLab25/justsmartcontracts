type TArg = string | number | null | undefined | false | Record<string, unknown>;

// Replaces the classnames package. Covers the two forms this app uses: plain
// strings and an object whose truthy keys become class names.
export const cn = (...args: TArg[]): string =>
  args
    .flatMap((arg) => {
      if (!arg) {
        return [];
      }
      if (typeof arg === "object") {
        return Object.entries(arg)
          .filter(([, on]) => Boolean(on))
          .map(([name]) => name);
      }
      return [String(arg)];
    })
    .join(" ");
