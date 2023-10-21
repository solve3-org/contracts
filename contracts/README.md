## Introduction

The `Solve3Verify.sol` contract is a critical component of the [Solve3](https://solve3.org) bot protection system. It enables you to verify Solve3 proofs and ensure secure interactions within your smart contracts. This documentation provides a detailed guide on integrating and using the `Solve3Verify` contract in your Ethereum-based projects.

- [Introduction](#introduction)
- [Quick Start](#quick-start)
  - [Step 1: Import the Contract](#step-1-import-the-contract)
  - [Step 2: Inherit from `Solve3Verify`](#step-2-inherit-from-solve3verify)
  - [Step 3: Initialize the Contract](#step-3-initialize-the-contract)
  - [Step 4: Abstract Function `disableSolve3`](#step-4-abstract-function-disablesolve3)
- [Optional Functions](#optional-functions)
  - [Set Valid From Timestamp](#set-valid-from-timestamp)
  - [Set Valid Period Seconds](#set-valid-period-seconds)
  - [Custom `validFrom` Implementation](#custom-validfrom-implementation)
  - [Custom `validPeriod` Implementation](#custom-validperiod-implementation)
- [Public Variables and View Functions](#public-variables-and-view-functions)
- [Events](#events)
- [Errors](#errors)


## Quick Start

Integrating the `Solve3Verify` contract into your project is a straightforward process. Here's a quick start guide:

### Step 1: Import the Contract

Begin by importing the `Solve3Verify` contract into your Solidity project.

```solidity
import "@solve3/contracts/Solve3Verify.sol";
```

### Step 2: Inherit from `Solve3Verify`

In your contract, inherit from the `Solve3Verify` contract.

```solidity
contract YourContract is Solve3Verify {
    // Your contract code here
}
```

### Step 3: Initialize the Contract

In your contract's constructor, call the `__init_Solve3Verify` function with the address of the Solve3 Master contract as an argument.

```solidity
constructor(address _solve3Master) {
    __init_Solve3Verify(_solve3Master);
    // Your constructor code here
}
```

### Step 4: Abstract Function `disableSolve3`

Since Solve3 is in beta, you have to implement a function to disable Solve3 verification in your contract.

**Note:** Please also add access control like OpenZeppelin `Ownable`

```solidity
function disableSolve3(bool _flag) external {
    _disableSolve3(_flag);
}
```

Your contract is now ready to verify Solve3 proofs for secure interactions.

## Optional Functions

The `Solve3Verify` contract provides optional functions to enhance flexibility and control in your project based on your personal needs or the chain you want to deploy to.

### Set Valid From Timestamp

To customize the timestamp from which the signature is valid, you can implement the following internal function:

```solidity
function _setValidFromTimestamp(uint256 _validFromTimestamp) internal {
    validFromTimestamp = _validFromTimestamp;
}
```

This function allows you to adjust the timestamp based on your specific requirements. 

**Note:** Per default the `validFromTimestamp` is set to timestamp of the contract deployment.

### Set Valid Period Seconds

You can modify the period in seconds for which the signature is valid using this internal function:

```solidity
function _setValidPeriodSeconds(uint256 _validPeriodSeconds) internal {
    validPeriodSeconds = _validPeriodSeconds;
}
```

Use this function to change the period for which the signature remains valid.

**Note:** Per default the `validPeriodSeconds` is set to 300 seconds.

Developers can customize the `validFrom` and `validPeriod` functionality by overriding the following functions:

### Custom `validFrom` Implementation

`function validFrom() public view virtual returns (uint256)`

This overridable function allows developers to modify the timestamp from which the signature is considered valid.

```solidity
function validFrom() public view virtual returns (uint256) {
    // Custom logic to determine the validFrom timestamp
    return yourCustomValidFromTimestamp;
}
```

### Custom `validPeriod` Implementation

 `function validPeriod() public view virtual returns (uint256)`
 
 This overridable function enables developers to change the period in seconds for which the signature remains valid.

```solidity
function validPeriod() public view virtual returns (uint256) {
    // Custom logic to determine the valid period in seconds
    return yourCustomValidPeriodSeconds;
}
```

These functions provide flexibility for developers to adapt Solve3 verification to their specific project requirements.


## Public Variables and View Functions

The `Solve3Verify` contract includes various public variables and view functions for inspecting its state. These include:

* `public solve3Master`: The address of the Solve3 Master contract.
* `public solve3Disabled`: A flag indicating whether Solve3 verification is disabled.
* `public validFromTimestamp`: The timestamp from which the signature is valid.
* `public validPeriodSeconds`: The period in seconds for which the signature is valid.

## Events

The `Solve3Verify` contract emits various events to track significant contract actions and state changes:

* `Solve3VerifyDisabled(bool disabled)`: Triggered when Solve3 verification is enabled or disabled.
* `Solve3VerifyInitialized(address indexed solve3Master)`: Indicates the successful initialization of the Solve3 contract.
* `Solve3VerifySuccess(address indexed account, uint256 timestamp)`: Recorded when Solve3 verification succeeds.
* `Solve3ValidFromTimestampSet(uint256 validFromTimestamp)`: Signals changes to the valid-from timestamp.
* `Solve3ValidPeriodSecondsSet(uint256 validPeriodSeconds)`: Notifies changes to the valid period in seconds.

## Errors

The `Solve3Verify` contract defines several errors that can be raised during contract execution. These errors provide information about specific issues or constraints. Here are the defined errors:

* `Solve3VerifyInitializedAlready()`: Raised when the Solve3 contract is initialized more than once.
* `Solve3VerifyIsDisabled()`: Triggered when Solve3 verification is disabled.
* `Solve3VerifyIsNotDisabled()`: Raised when Solve3 verification is enabled.
* `Solve3VerifyUnableToVerify()`: Indicates a failure to verify a Solve3 proof.
* `Solve3VerifyAddressMismatch()`: Raised when the account address does not match the sender's address.
* `Solve3VerifyMsgSignedTooEarly()`: Occurs when the message is signed too early.
* `Solve3VerifySignatureInvalid()`: Raised when the Solve3 signature is invalid.