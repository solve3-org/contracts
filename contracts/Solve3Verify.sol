//SPDX-License-Identifier: MIT

pragma solidity >=0.8.14;

import "./ISolve3Master.sol";

/// @title
/// @author 0xKurt
/// @notice Abstract contract to verify proofs
abstract contract Solve3Verify {
    // ============ Storage ============

    // The Solve3Master contract
    ISolve3Master public solve3Master;

    // If Solve3 is disabled
    bool public solve3Disabled;

    // The timestamp from which the signature is valid
    uint256 public validFromTimestamp;

    // The period in seconds for which the signature is valid
    uint256 public validPeriodSeconds;

    // ============ Initializer ============
    /// @notice Initialize the contract with default values
    /// @dev Default values are: validFromTimestamp = block timestamp, validPeriodSeconds = 300
    /// @param _solve3Master the Solve3Master contract
    function __init_Solve3Verify(address _solve3Master) internal {
        if (_solve3Master == address(0)) revert Solve3VerifyInitializedAlready();
        solve3Master = ISolve3Master(_solve3Master);
        validFromTimestamp = block.timestamp;
        validPeriodSeconds = 300;
        emit Solve3VerifyInitialized(_solve3Master);
    }

    // ============ Modifiers ============

    /// @notice Verify the proof
    /// @dev If Solve3 is disabled, the modifier will not verify the proof
    /// @dev Will revert if the proof is not valid or the timestamp is invalid or the account is not the sender
    /// @param _proof the proof to verify
    modifier solve3Verify(bytes memory _proof) {
        if (!solve3Disabled && solve3Master != ISolve3Master(address(0))) {
            (address account, uint256 timestamp, bool verified) = solve3Master.verifyProof(_proof);

            if (!verified) revert Solve3VerifyUnableToVerify();
            if (account != msg.sender) revert Solve3VerifyAddressMismatch();
            if (timestamp < validFrom()) revert Solve3VerifyMsgSignedTooEarly();
            if (timestamp + validPeriod() < block.timestamp) {
                revert Solve3VerifySignatureInvalid();
            }
            emit Solve3VerifySuccess(account, timestamp);
        }
        _;
    }

    /// @notice Modifier to if Solve3 is disabled
    modifier solve3IsDisabled() {
        if (!solve3Disabled) revert Solve3VerifyIsNotDisabled();
        _;
    }

    /// @notice Modifier to if Solve3 is not disabled
    modifier solve3IsNotDisabled() {
        if (solve3Disabled) revert Solve3VerifyIsDisabled();
        _;
    }

    // ============ Functions ============
    /// @notice Get the timestamp from which the signature is valid
    /// @dev Overridable function to allow for changing the timestamp from which the signature is valid
    /// @return the timestamp from which the signature is valid
    function validFrom() public view virtual returns (uint256) {
        return validFromTimestamp;
    }

    /// @notice Get the period in seconds for which the signature is valid
    /// @dev Overridable function to allow for changing the period in seconds for which the signature is valid
    /// @return the period in seconds for which the signature is valid
    function validPeriod() public view virtual returns (uint256) {
        return validPeriodSeconds;
    }

    /// @notice Abstract function to disable Solve3
    /// @dev Must be implemented by the inheriting contract to be able to disable Solve3
    /// @param _disabled If Solve3 should be disabled
    function disableSolve3(bool _disabled) external virtual;

    /// @notice Internal function to disable Solve3
    /// @dev Can be used by the abstract function to disable Solve3
    function _disableSolve3(bool _disabled) internal {
        solve3Disabled = _disabled;
        emit Solve3VerifyDisabled(_disabled);
    }

    /// @notice Set the Valid From Timestamp
    /// @dev Can be used to change the timestamp from which the signature is valid
    function _setValidFromTimestamp(uint256 _validFromTimestamp) internal {
        validFromTimestamp = _validFromTimestamp;
        emit Solve3ValidFromTimestampSet(_validFromTimestamp);
    }

    /// @notice Abstract function to set the Valid Period Seconds
    /// @dev Can be used to change the period in seconds for which the signature is valid
    /// @param _validPeriodSeconds the period in seconds for which the signature is valid
    function setValidPeriodSeconds(uint256 _validPeriodSeconds) external virtual {
        _setValidPeriodSeconds(_validPeriodSeconds);
    }

    /// @notice Internal function to set the Valid Period Seconds
    /// @dev Can be used by the abstract function to change the period in seconds for which the signature is valid
    /// @param _validPeriodSeconds the period in seconds for which the signature is valid
    function _setValidPeriodSeconds(uint256 _validPeriodSeconds) internal {
        validPeriodSeconds = _validPeriodSeconds;
        emit Solve3ValidPeriodSecondsSet(_validPeriodSeconds);
    }

    // ============ Events ============

    event Solve3VerifyDisabled(bool disabled);
    event Solve3VerifyInitialized(address indexed solve3Master);
    event Solve3VerifySuccess(address indexed account, uint256 timestamp);
    event Solve3ValidFromTimestampSet(uint256 validFromTimestamp);
    event Solve3ValidPeriodSecondsSet(uint256 validPeriodSeconds);

    // ============ Errors ============

    error Solve3VerifyInitializedAlready();
    error Solve3VerifyIsDisabled();
    error Solve3VerifyIsNotDisabled();
    error Solve3VerifyUnableToVerify();
    error Solve3VerifyAddressMismatch();
    error Solve3VerifyMsgSignedTooEarly();
    error Solve3VerifySignatureInvalid();
}
