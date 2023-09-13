//SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "./MasterStorage.sol";
import "./ISolve3Master.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Solve3Master is ISolve3Master, MasterStorage {
    constructor(bool behindProxy) {
        initialized = behindProxy;
    }

    function initialize(address _signer) external {
        if (initialized) revert AlreadyInitialized();
        if (owner != address(0)) revert TransferOwnershipFailed();

        initialized = true;
        _transferOwnership(msg.sender);
        _setSigner(_signer, true);

        DOMAIN_SEPARATOR = _hash(
            EIP712Domain({
                name: "Solve3",
                version: "1",
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );
    }

    // ============ Views ============

    function getNonce(address _account)
        external
        view
        override
        returns (uint256)
    {
        return nonces[_account];
    }

    function getTimestampAndNonce(address _account)
        external
        view
        returns (uint256, uint256)
    {
        return (block.timestamp, nonces[_account]);
    }

    function isSigner(address _account) external view returns (bool) {
        return signer[_account];
    }

    // ============ Owner Functions ============

    function setSigner(address _account, bool _flag) external {
        _onlyOwner();
        _setSigner(_account, _flag);
    }

    function _setSigner(address _account, bool _flag) internal {
        signer[_account] = _flag;
        emit SignerChanged(_account, _flag);
    }

    function transferOwnership(address _newOwner) external {
        _onlyOwner();
        _transferOwnership(_newOwner);
    }

    function _transferOwnership(address _newOwner) internal {
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    function recoverERC20(address _token) external {
        _onlyOwner();
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(msg.sender, balance);
    }

    // ============ EIP 712 Functions ============

    function verifyProof(bytes calldata _proof)
        external
        returns (
            address account,
            uint256 timestamp,
            bool verified
        )
    {
        return _verifyProof(_proof);
    }

    function _verifyProof(bytes calldata _proof)
        internal
        returns (
            address,
            uint256,
            bool
        )
    {
        Proof memory proof = abi.decode(_proof, (Proof));
        ProofData memory proofData = proof.data;
        bool verified;
        address signerAddress;

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, _hash(proofData))
        );

        signerAddress = ecrecover(digest, proof.v, proof.r, proof.s);
        
        if (
            nonces[proofData.account] == proofData.nonce &&
            proofData.timestamp < block.timestamp &&
            signer[signerAddress] &&
            msg.sender == proofData.destination
        ) {
            verified = true;
            nonces[proofData.account] += 1;
        } else {
          revert Solve3MasterNotVerified();
        }

        return (proofData.account, proofData.timestamp, verified);
    }

    function _hash(EIP712Domain memory _eip712Domain)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    EIP712DOMAIN_TYPEHASH,
                    keccak256(bytes(_eip712Domain.name)),
                    keccak256(bytes(_eip712Domain.version)),
                    _eip712Domain.chainId,
                    _eip712Domain.verifyingContract
                )
            );
    }

    function _hash(ProofData memory _data) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PROOFDATA_TYPEHASH,
                    _data.account,
                    _data.nonce,
                    _data.timestamp,
                    _data.destination
                )
            );
    }

    // ============ Modifier like functions ============
    function _onlyOwner() internal view {
        if (msg.sender != owner) revert NotOwner();
    }

    // ============ Errors ============
    error AlreadyInitialized();
    error TransferOwnershipFailed();
    error NotOwner();
    error Solve3MasterNotVerified();

    // ============ Events ============
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event SignerChanged(address indexed account, bool flag);
}
