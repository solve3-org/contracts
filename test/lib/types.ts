export type TypedData = {
  domain: EIP712Domain;
  message: ProofData;
  primaryType: string;
  types: any;
}

export type EIP712Domain = {
  name?: string;
  version?: string;
  chainId: number;
  verifyingContract: string;
}

export type ProofData = {
  account: string;
  nonce: number;
  timestamp: number;
  destination: string;
}

export type Proof = {
  s: string;
  r: string;
  v: number;
  data: ProofData;
}