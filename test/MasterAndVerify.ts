import { expect } from "chai";
import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { Solve3Master, Solve3VerifyMock } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { signAndEncodeChainProof, typedData } from "./lib/eip712SigUtils";
import { EIP712Domain, ProofData } from "./lib/types";

import hre from "hardhat";
const chainId = hre.network.config.chainId;

async function fixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const signer = ethers.Wallet.createRandom();

  const masterFactory = await ethers.getContractFactory("Solve3Master");
  const master = await masterFactory.deploy(false);
  await master.deployed();

  await master.initialize(signer.address);

  const verifyFactory = await ethers.getContractFactory("Solve3VerifyMock");
  const verify = await verifyFactory.deploy(master.address);
  await verify.deployed();

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
    expect(await master.owner()).to.equal(owner.address);
  });

  it("should fail when try to initialize a second time", async () => {
    await expect(master.initialize(addr1.address)).to.be.reverted;
  });

  it("should return the right nonce", async function () {
    const timestampAndNonce = await master.getTimestampAndNonce(addr2.address);
    expect(timestampAndNonce[1]).to.equal(0);
  });

  it("should return true for signer", async function () {
    const isSigner = await master.isSigner(signer.address);
    expect(isSigner).to.equal(true);
  });

  it("should return false for non-signer", async function () {
    const isSigner = await master.isSigner(addr2.address);
    expect(isSigner).to.equal(false);
  });

  it("should validate proof", async function () {
    const tsAndNonce = await master.getTimestampAndNonce(addr1.address);
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.address,
    };

    const data: ProofData = {
      account: addr2.address,
      nonce: nonce.toNumber(),
      timestamp: timestamp.toNumber(),
      destination: owner.address,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);
    await hre.network.provider.send("evm_mine");
    const isValid = await master.callStatic.verifyProof(proof);

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
    const tsAndNonce = await master.getTimestampAndNonce(addr1.address);
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.address,
    };

    const data: ProofData = {
      account: addr2.address,
      nonce: nonce.toNumber(),
      timestamp: timestamp.toNumber(),
      destination: verify.address,
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
      verifyingContract: owner.address,
    };

    const data: ProofData = {
      account: owner.address,
      nonce: 7777777777777777,
      timestamp: 1234567890,
      destination: owner.address,
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
    const tsAndNonce = await master.getTimestampAndNonce(addr1.address);
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.address,
    };

    const data: ProofData = {
      account: addr2.address,
      nonce: nonce.toNumber(),
      timestamp: timestamp.toNumber(),
      destination: verify.address,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });

  it("should not be able to set the number with wrong nonce", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(addr1.address);
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.address,
    };

    const data: ProofData = {
      account: addr2.address,
      nonce: nonce.toNumber() + 1,
      timestamp: timestamp.toNumber(),
      destination: verify.address,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });

  it("should not be able to set the number with wrong timestamp", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(addr1.address);
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.address,
    };

    const data: ProofData = {
      account: addr2.address,
      nonce: nonce.toNumber(),
      timestamp: timestamp.toNumber() + 1,
      destination: verify.address,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });

  it("should not be able to set the number with wrong destination", async () => {
    const tsAndNonce = await master.getTimestampAndNonce(addr1.address);
    const timestamp = tsAndNonce[0];
    const nonce = tsAndNonce[1];

    const domain: EIP712Domain = {
      name: "Solve3",
      version: "1",
      chainId: chainId || 31337,
      verifyingContract: master.address,
    };

    const data: ProofData = {
      account: addr2.address,
      nonce: nonce.toNumber(),
      timestamp: timestamp.toNumber(),
      destination: addr1.address,
    };

    const typedDataObject = typedData(domain, data);
    const proof = await signAndEncodeChainProof(signer, typedDataObject);

    await expect(verify.connect(addr1).setNumber(proof, 42)).to.reverted;
  });
});
