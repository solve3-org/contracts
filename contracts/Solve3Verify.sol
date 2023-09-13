//SPDX-License-Identifier: MIT

pragma solidity 0.8.14;
import "./ISolve3Master.sol";

abstract contract Solve3Verify {
    ISolve3Master public solve3Master;
    bool public solve3Disabled;
    uint256 public validFromTimestamp;
    uint256 public validPeriodSeconds;

    function __init_Solve3Verify(address _solve3Master) internal {
        solve3Master = ISolve3Master(_solve3Master);
        validFromTimestamp = block.timestamp;
        validPeriodSeconds = 300;
        solve3Disabled = false;
        emit Solve3VerifyInitialized(_solve3Master);
    }

    modifier solve3Verify(bytes memory _proof) {
        if (!solve3Disabled && solve3Master != ISolve3Master(address(0))) {
            (address account, uint256 timestamp, bool verified) = solve3Master
                .verifyProof(_proof);

            if (!verified) revert Solve3VerifyUnableToVerify();
            if (account != msg.sender) revert Solve3VerifyAddressMismatch();
            if (timestamp < validFrom()) revert Solve3VerifyMsgSignedTooEarly();
            if (timestamp + validPeriod() < block.timestamp)
                revert Solve3VerifySignatureInvalid();
            emit Solve3VerifySuccess(account, timestamp);
        }
        _;
    }

    modifier solve3IsDisabled() {
        if (!solve3Disabled) revert Solve3VerifyIsNotDisabled();
        _;
    }

    modifier solve3IsNotDisabled() {
        if (solve3Disabled) revert Solve3VerifyIsDisabled();
        _;
    }

    function validFrom() public view virtual returns (uint256) {
        return validFromTimestamp;
    }

    function validPeriod() public view virtual returns (uint256) {
        return validPeriodSeconds;
    }

    function disableSolve3(bool _disabled) external virtual;

    function _disableSolve3(bool _disabled) internal {
        solve3Disabled = _disabled;
        emit Solve3VerifyDisabled(_disabled);
    }

    function _setValidFromTimestamp(uint256 _validFromTimestamp) internal {
        validFromTimestamp = _validFromTimestamp;
    }

    function setValidPeriodSeconds(uint256 _validPeriodSeconds)
        external
        virtual;

    function _setValidPeriodSeconds(uint256 _validPeriodSeconds) internal {
        validPeriodSeconds = _validPeriodSeconds;
    }

    // ============ Events ============

    event Solve3VerifyDisabled(bool disabled);
    event Solve3VerifyInitialized(address indexed solve3Master);
    event Solve3VerifySuccess(address indexed account, uint256 timestamp);

    // ============ Errors ============

    error Solve3VerifyIsDisabled();
    error Solve3VerifyIsNotDisabled();
    error Solve3VerifyUnableToVerify();
    error Solve3VerifyAddressMismatch();
    error Solve3VerifyMsgSignedTooEarly();
    error Solve3VerifySignatureInvalid();

}
