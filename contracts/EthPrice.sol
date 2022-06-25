// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library EthPrice {
  function getPrice(AggregatorV3Interface priceFeed) view internal returns (uint256) {
    (
      /*uint80 roundID*/,
      int price,
      /*uint startedAt*/,
      /*uint timeStamp*/,
      /*uint80 answeredInRound*/
    ) = priceFeed.latestRoundData();
    return uint256(price * 1e10);
  }

  function getEthInUsd (uint256 ethValue, AggregatorV3Interface priceFeed) internal view returns (uint256) {
    uint256 ethPrice = getPrice(priceFeed);
    return (ethPrice * ethValue) / 1e18;
  }
}