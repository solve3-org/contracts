import { AbiCoder, ethers } from "ethers";
import { signTypedData_v4 as sign } from "eth-sig-util";
import { EIP712Domain, ProofData, TypedData } from "./types";
import { splitSignature } from "@ethersproject/bytes";

export const typedData = (domain: EIP712Domain, data: ProofData): TypedData => {
  return {
    domain: {
      // Defining the chain aka Rinkeby testnet or Ethereum Main Net
      chainId: domain.chainId,
      // Give a user friendly name to the specific contract you are signing for.
      name: domain.name || "Solve3",
      // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
      verifyingContract: domain.verifyingContract,
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: domain.version || "1",
    },

    // Defining the message signing data content.
    message: data,
    // Refers to the keys of the *types* object below.
    primaryType: "ProofData",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      ProofData: [
        { name: "account", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "timestamp", type: "uint256" },
        { name: "destination", type: "address" },
      ],
    },
  };
};

export const typedDataStringify = (
  domain: EIP712Domain,
  data: ProofData,
): string => {
  return JSON.stringify(typedData(domain, data));
};

export const signTypedData = (
  signer: ethers.Wallet,
  typedData: TypedData,
): string => {
  return sign(Buffer.from(signer.privateKey.slice(2), "hex"), {
    data: typedData,
  } as any);
};

export const encodeChainProof = (
  signature: string,
  data: ProofData,
): string => {
  const sig = splitSignature(signature);

  const result = new AbiCoder().encode(
    ["bytes32", "bytes32", "uint8", "tuple(address,uint256,uint256,address)"],
    [
      sig.s,
      sig.r,
      sig.v,
      [data.account, data.nonce, data.timestamp, data.destination],
    ],
  );
  return result;
};

export const signAndEncodeChainProof = async (
  signer: ethers.Wallet,
  typedData: TypedData,
): Promise<string> => {
  const sig = signTypedData(signer, typedData);
  return encodeChainProof(sig, typedData.message);
};
