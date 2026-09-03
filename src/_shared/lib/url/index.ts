// Replaces url-join. We only ever join an explorer base with a known path, so
// trimming the slashes on either side of the seam is the whole job.
export const joinUrl = (base: string, ...parts: string[]) =>
  [base.replace(/\/+$/, ""), ...parts.map((p) => p.replace(/^\/+|\/+$/g, ""))]
    .filter(Boolean)
    .join("/");
