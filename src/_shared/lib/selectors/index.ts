// Looks up a 4 byte selector in the public signature directories. Used only
// when the contract's own abi doesn't contain the error, which happens when a
// call reverts inside a library or another contract.

const cache = new Map<string, string | null>();

const fromOpenchain = async (selector: string) => {
  const response = await fetch(
    `https://api.openchain.xyz/signature-database/v1/lookup?function=${selector}&filter=true`
  );
  const data = await response.json();

  return data?.result?.function?.[selector]?.[0]?.name ?? null;
};

const from4byte = async (selector: string) => {
  const response = await fetch(
    `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`
  );
  const data = await response.json();

  // Lowest id is the earliest submission, which is the least likely to be one
  // of the junk collisions people have mined into the database.
  const best = (data?.results ?? [])
    .slice()
    .sort((a: any, b: any) => a.id - b.id)[0];

  return best?.text_signature ?? null;
};

export const lookupSelector = async (
  selector: string
): Promise<string | null> => {
  const key = selector.toLowerCase();

  if (cache.has(key)) {
    return cache.get(key) ?? null;
  }

  let name: string | null = null;

  try {
    name = await fromOpenchain(key);
  } catch {
    name = null;
  }

  if (!name) {
    try {
      name = await from4byte(key);
    } catch {
      name = null;
    }
  }

  cache.set(key, name);
  return name;
};
