import { isAddress, isHex, size } from "viem";
import type { TAbiParam, TAbiParamType } from "../model/types";

// What the form holds for one parameter. Scalars stay strings (or a boolean for
// bool); tuples and arrays nest, positionally, so anonymous tuple components
// work the same as named ones.
export type TParamFormValue = unknown;

export const isArrayType = (type: TAbiParamType) => type.endsWith("]");

// "uint256[2][]" -> "uint256[2]"
export const getArrayItemType = (type: TAbiParamType) =>
  type.slice(0, type.lastIndexOf("["));

// "uint256[3]" -> 3, "uint256[]" -> null for a dynamic array
export const getArrayLength = (type: TAbiParamType): number | null => {
  const size = type.slice(type.lastIndexOf("[") + 1, -1);
  return size ? Number(size) : null;
};

export const isTupleType = (type: TAbiParamType) => type === "tuple";

export const isScalarType = (type: TAbiParamType) =>
  !isArrayType(type) && !isTupleType(type);

// A dynamic array of scalars is typed as one comma separated line. Anything
// nested (arrays of structs, arrays of arrays) keeps the row-by-row editor,
// because commas can't say where one item ends and the next begins.
export const isCommaSeparated = (param: TAbiParam) =>
  isArrayType(param.type) &&
  getArrayLength(param.type) === null &&
  isScalarType(getArrayItemType(param.type));

export const getComponents = (param: TAbiParam): readonly TAbiParam[] =>
  "components" in param && param.components ? param.components : [];

// Same param with one level of array brackets stripped, so recursion can carry
// a tuple's components down into its items.
const itemParam = (param: TAbiParam): TAbiParam =>
  ({ ...param, type: getArrayItemType(param.type) }) as TAbiParam;

const isIntType = (type: TAbiParamType) =>
  type.startsWith("uint") || type.startsWith("int");

const toScalar = (type: TAbiParamType, value: unknown, path: string) => {
  if (type === "bool") {
    return typeof value === "boolean" ? value : value === "true";
  }

  const raw = typeof value === "string" ? value.trim() : value;

  if (isBytesType(type)) {
    if (raw === "" || raw === undefined || raw === null) {
      const fixed = fixedBytesLength(type);
      return fixed === null ? "0x" : `0x${"00".repeat(fixed)}`;
    }
    return raw;
  }

  if (isIntType(type)) {
    try {
      return BigInt((raw as string) || "0");
    } catch {
      throw new Error(`${path}: "${raw}" is not a valid ${type}`);
    }
  }

  return raw ?? "";
};

// Walks the abi parameter and the form value together, so nesting depth is
// driven by the abi rather than guessed from the string. This is what replaces
// the old arg.split(",") that could only ever handle one flat level.
export const toAbiValue = (
  param: TAbiParam,
  value: unknown,
  path = param.name || param.type
): unknown => {
  if (isArrayType(param.type)) {
    const child = itemParam(param);

    const items = Array.isArray(value)
      ? value
      : typeof value === "string" && isCommaSeparated(param)
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
        : [];

    return items.map((item, index) =>
      toAbiValue(child, item, `${path}[${index}]`)
    );
  }

  if (isTupleType(param.type)) {
    const components = getComponents(param);
    const values = Array.isArray(value) ? value : [];

    // Positional array rather than an object: viem accepts both, and this one
    // also works when the components have no names.
    return components.map((component, index) =>
      toAbiValue(
        component,
        values[index],
        `${path}.${component.name || index}`
      )
    );
  }

  return toScalar(param.type, value, path);
};

export const toAbiArgs = (
  params: readonly TAbiParam[],
  values: unknown[]
): unknown[] => params.map((param, index) => toAbiValue(param, values[index]));

const scalarDefault = (type: TAbiParamType) => {
  if (type === "bool") {
    return false;
  }
  if (type === "address") {
    return "0x0000000000000000000000000000000000000000";
  }
  if (isIntType(type)) {
    return "0";
  }
  return "";
};

// Mirrors toAbiValue's shape so the form starts out with the right nesting.
export const getDefaultParamValue = (param: TAbiParam): unknown => {
  if (isArrayType(param.type)) {
    // Comma separated arrays are a text field, so they start as an empty string.
    if (isCommaSeparated(param)) {
      return "";
    }

    const length = getArrayLength(param.type);
    const child = itemParam(param);

    return length === null
      ? []
      : Array.from({ length }, () => getDefaultParamValue(child));
  }

  if (isTupleType(param.type)) {
    return getComponents(param).map(getDefaultParamValue);
  }

  return scalarDefault(param.type);
};

// Nested things need the full row; scalars can sit two to a row.
export const isComplexParam = (param: TAbiParam) =>
  (isArrayType(param.type) && !isCommaSeparated(param)) ||
  isTupleType(param.type);

// Two columns only pay off on a long form. At four fields or fewer a single
// column reads better than half-width inputs sitting side by side.
export const shouldUseColumns = (fieldCount: number) => fieldCount > 4;

export const isBytesType = (type: TAbiParamType) =>
  type === "bytes" || /^bytes\d+$/.test(type);

// bytes32 -> 32, bytes -> null for the dynamic kind
export const fixedBytesLength = (type: TAbiParamType): number | null => {
  const match = /^bytes(\d+)$/.exec(type);
  return match ? Number(match[1]) : null;
};

const intBounds = (type: TAbiParamType) => {
  const signed = type.startsWith("int");
  const bits = Number(type.slice(signed ? 3 : 4) || "256");

  return signed
    ? { min: -(2n ** BigInt(bits - 1)), max: 2n ** BigInt(bits - 1) - 1n }
    : { min: 0n, max: 2n ** BigInt(bits) - 1n };
};

// Returns a message when the value can't be encoded, null when it's fine.
// Without this an invalid address reached encodeFunctionData, which throws
// during render and takes the whole page down via the error boundary.
export const validateScalar = (
  type: TAbiParamType,
  value: unknown
): string | null => {
  if (type === "bool") {
    return null;
  }

  const raw = typeof value === "string" ? value.trim() : value;
  const text = raw === undefined || raw === null ? "" : String(raw);

  if (type === "address") {
    return isAddress(text) ? null : "Not a valid address";
  }

  if (isBytesType(type)) {
    // Empty is allowed and encodes as zero.
    if (text === "") {
      return null;
    }
    if (!isHex(text)) {
      return "Must be 0x-prefixed hex";
    }

    const fixed = fixedBytesLength(type);
    if (fixed !== null && size(text) !== fixed) {
      return `Must be exactly ${fixed} bytes`;
    }
    return null;
  }

  if (isIntType(type)) {
    if (text === "") {
      return "Required";
    }

    let parsed: bigint;
    try {
      parsed = BigInt(text);
    } catch {
      return `Not a valid ${type}`;
    }

    const { min, max } = intBounds(type);
    if (parsed < min || parsed > max) {
      return `Out of range for ${type}`;
    }
    return null;
  }

  return null;
};

// Each entry of a comma separated array is checked on its own so the message
// can say which one is wrong.
export const validateCommaSeparated = (
  param: TAbiParam,
  value: unknown
): string | null => {
  const itemType = getArrayItemType(param.type);
  const text = typeof value === "string" ? value : "";

  const items = text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");

  for (let index = 0; index < items.length; index += 1) {
    const error = validateScalar(itemType, items[index]);
    if (error) {
      return `Item ${index}: ${error}`;
    }
  }

  return null;
};
