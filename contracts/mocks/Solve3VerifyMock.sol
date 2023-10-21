//SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "../Solve3Verify.sol";

contract Solve3VerifyMock is Solve3Verify {
    address owner;
    uint256 public number;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _solve3Master) {
        __init_Solve3Verify(_solve3Master);
        owner = msg.sender;
    }

    function disableSolve3(bool _disabled) external override onlyOwner {
        _disableSolve3(_disabled);
    }

    function setValidPeriodSeconds(uint256 _validPeriodSeconds)
        external
        onlyOwner
    {
        _setValidPeriodSeconds(_validPeriodSeconds);
    }

    function setNumber(bytes memory _proof, uint256 _number) external solve3Verify(_proof) {
        number = _number;
    }

    function getNumber() external view returns (uint256) {
        return number;
    }
}
