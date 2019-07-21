const Funding = artifacts.require("./Funding.sol");

const ETHERS = 10 ** 18;
const GOAL = 20 * ETHERS;

module.exports = function (deployer) {
    deployer.deploy(Funding, GOAL);
};