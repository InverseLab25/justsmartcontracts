import { TUid } from "@shared/lib/id";
import type {
  Abi,
  AbiEvent as ViemAbiEvent,
  AbiFunction as ViemAbiFunction,
  AbiItem as ViemAbiItem,
  AbiParameter as ViemAbiParameter,
  GetLogsReturnType,
} from "viem";
import { TChainId, TAddress } from "@shared/lib/web3";

// viem re-exports abitype's types, so we don't depend on abitype directly.
// AbiConstructor is the one it leaves out, hence picking it off the union.
export type TAbiConstructor = Extract<Abi[number], { type: "constructor" }>;
export type TAbiEvent = ViemAbiEvent;
export type TAbiFunction = ViemAbiFunction;
export type TAbiItem = ViemAbiItem;

export type TAbiParam = ViemAbiParameter;
export type TAbiParamType = TAbiParam["type"];

export type TEventLogs = GetLogsReturnType<ViemAbiEvent>;

export type TContract = {
  id: TUid;
  chain: TChainId;
  address: TAddress;
  name: string;
  abi: TAbiItem[];
};

export type TContractWithoutId = Omit<TContract, "id">;
