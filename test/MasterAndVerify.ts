import "mocha";

import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { Solve3Master, Solve3VerifyMock } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { signAndEncodeChainProof, typedData } from "./lib/eip712SigUtils";
import { EIP712Domain, ProofData } from "./lib/types";

import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
const chainId = hre.network.config.chainId;

async function fixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const signer = ethers.Wallet.createRandom() as unknown as Wallet;

  const masterFactory = await ethers.getContractFactory("Solve3Master");
  const master = await masterFactory.deploy();

  await master.initialize(signer.address as string);

  const verifyFactory = await ethers.getContractFactory("Solve3VerifyMock");
  const verify = await verifyFactory.deploy(master.target as string);

  return {
    owner,
    signer,
    addr1,
    addr2,
    master,
    verify,
  };
}

describe("Master", async () => {
  let owner: SignerWithAddress,
    signer: Wallet,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    master: Solve3Master,
    verify: Solve3VerifyMock;
  beforeEach(async () => {
    ({ owner, signer, addr1, addr2, master, verify } = await loadFixture(
      fixture,
    ));
    verify;
  });

  it("should have the right owner", async () => {
    expect(await master.owner()).to.equal(owner.address as string);
  });

  it("should fail when try to initialize a second time", async () => {
    await expect(master.initialize(addr1.address as string)).to.be.reverted;
  });

  it("should return the right nonce", async function () {
    const timestampAndNonce = await master.getTimestampAndNonce(
      addr2.address as string,
    );
    expect(timestampAndNonce[1]).to.equal(0);
  });

  it("should return true for signer", async function () {
    const isSigner = await master.isSigner(signer.address as string);
    expect(isSigner).to.equal(true);
  });

  it("should return false for non-signer", async function () {
    const isSigner = await master.isSigner(addr2.address as string);
    expect(isSigner).to.equal(false);
  });

  it("should validate proof", async function () {
    const tsAndNonce = await master.getTimestampAndNonce(
      addr1.address as string,
    );
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.target as string,
    };

    const data: ProofData = {
      account: addr2.address as string,
      nonce: Number(nonce.toString()),
      timestamp: Number(timestamp.toString()),
      destination: owner.address as string,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);
    await hre.network.provider.send("evm_mine");
    const isValid = await master.verifyProof.staticCall(proof);

    expect(isValid.verified).to.equal(true);
  });
});

describe("Verify", async () => {
  let owner: SignerWithAddress,
    signer: Wallet,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    master: Solve3Master,
    verify: Solve3VerifyMock;
  beforeEach(async () => {
    ({ owner, signer, addr1, addr2, master, verify } = await loadFixture(
      fixture,
    ));
  });

  it("should be able to set the number", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(
      addr1.address as string,
    );
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.target as string,
    };

    const data: ProofData = {
      account: addr2.address as string,
      nonce: Number(nonce.toString()),
      timestamp: Number(timestamp.toString()),
      destination: verify.target as string,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await verify.connect(addr2).setNumber(proof, 42);
    expect(await verify.number()).to.equal(42);
  });

  it("should be able to set the number when Solve3 is disabled with any byte string 1", async () => {
    const domain: EIP712Domain = {
      name: "HelloWorld",
      version: "101",
      chainId: 69,
      verifyingContract: owner.address as string,
    };

    const data: ProofData = {
      account: owner.address as string,
      nonce: 7777777777777777,
      timestamp: 1234567890,
      destination: owner.address as string,
    };

    await verify.disableSolve3(true);

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await verify.connect(addr2).setNumber(proof, 42);
    expect(await verify.number()).to.equal(42);
  });

  it("should be able to set the number when Solve3 is disabled with any byte string 2", async () => {
    await verify.disableSolve3(true);
    await verify.connect(addr2).setNumber("0x", 42);
    expect(await verify.number()).to.equal(42);
  });

  it("should not be able to set the number with wrong sender", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(
      addr1.address as string,
    );
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.target as string,
    };

    const data: ProofData = {
      account: addr2.address as string,
      nonce: Number(nonce.toString()),
      timestamp: Number(timestamp.toString()),
      destination: verify.target as string,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });

  it("should not be able to set the number with wrong nonce", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(
      addr1.address as string,
    );
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.target as string,
    };

    const data: ProofData = {
      account: addr2.address as string,
      nonce: Number(nonce.toString()) + 1,
      timestamp: Number(timestamp.toString()),
      destination: verify.target as string,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });

  it("should not be able to set the number with wrong timestamp", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(
      addr1.address as string,
    );
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.target as string,
    };

    const data: ProofData = {
      account: addr2.address as string,
      nonce: Number(nonce.toString()),
      timestamp: Number(timestamp.toString()) + 1,
      destination: verify.target as string,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });

  it("should not be able to set the number with wrong destination", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(
      addr1.address as string,
    );
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.target as string,
    };

    const data: ProofData = {
      account: addr2.address as string,
      nonce: Number(nonce.toString()),
      timestamp: Number(timestamp.toString()),
      destination: addr1.address as string,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });
});
