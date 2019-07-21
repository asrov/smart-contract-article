const Funding = artifacts.require("Funding");
require("chai").use(require("chai-bignumber")(web3.BigNumber)).should();
const math = require('mathjs')

contract("Funding", function ([account, firstDonator, secondDonator]) {

    const ETHERS = 10 ** 18;
    const GAS_PRICE = 10 ** 6;

    let fundingContract = null;
    let txEvent;

    function findEvent(logs, eventName) {
        let result = null;
        for (let log of logs) {
            if (log.event === eventName) {
                result = log;
                break;
            }
        }
        return result;
    };

    it("should check the owner is valid", async () => {
        fundingContract = await Funding.deployed();
        const owner = await fundingContract.owner.call()
        owner.should.be.bignumber.equal(account);
    });

    it("should accept donations from the donator #1", async () => {
        const bFirstDonator = web3.eth.getBalance(firstDonator);

        const donate = await fundingContract.donate({
            from: firstDonator,
            value: 5 * ETHERS,
            gasPrice: GAS_PRICE
        });
        txEvent = findEvent(donate.logs, "Donated");
        txEvent.args.donation.should.be.bignumber.equal(5 * ETHERS);

        const difference = bFirstDonator.sub(web3.eth.getBalance(firstDonator)).sub(new web3.BigNumber(donate.receipt.gasUsed * GAS_PRICE));
        difference.should.be.bignumber.equal(5 * ETHERS);
    });

    it("should check if donation is not completed", async () => {
        const isFunded = await fundingContract.isFunded();
        isFunded.should.be.equal(false);
    });

    it("should not allow to withdraw the fund until the required amount has been collected", async () => {
        let isCaught = false;

        try {
            await fundingContract.withdraw({ gasPrice: GAS_PRICE });
        } catch (err) {
            isCaught = true;
        }
        isCaught.should.be.equal(true);
    });

    it("should accept donations from the donator #2", async () => {
        const bSecondDonator = web3.eth.getBalance(secondDonator);

        const donate = await fundingContract.donate({
            from: secondDonator,
            value: 20 * ETHERS,
            gasPrice: GAS_PRICE
        });
        txEvent = findEvent(donate.logs, "Donated");
        txEvent.args.donation.should.be.bignumber.equal(20 * ETHERS);

        const difference = bSecondDonator.sub(web3.eth.getBalance(secondDonator)).sub(new web3.BigNumber(donate.receipt.gasUsed * GAS_PRICE));
        difference.should.be.bignumber.equal(15 * ETHERS);
    });

    it("should check if the donation is completed", async () => {
        const notFunded = await fundingContract.isFunded();
        notFunded.should.be.equal(true);
    });

    it("should check if donated amount of money is correct", async () => {
        const raised = await fundingContract.raised.call();
        raised.should.be.bignumber.equal(20 * ETHERS);
    });

    it("should not accept donations if the fundraising is completed", async () => {
        let isCaught = false;

        try {
            await fundingContract.donate({ from: firstDonator, value: 10 * ETHERS });
        } catch (err) {
            isCaught = true;
        }
        isCaught.should.be.equal(true);
    });

    it("should allow the owner to withdraw the fund", async () => {
        const bAccount = web3.eth.getBalance(account);

        const withdraw = await fundingContract.withdraw({ gasPrice: GAS_PRICE });
        txEvent = findEvent(withdraw.logs, "Withdrew");
        txEvent.args.amount.should.be.bignumber.equal(20 * ETHERS);

        const difference = web3.eth.getBalance(account).sub(bAccount);
        difference.should.be.bignumber.equal(await fundingContract.raised.call() - withdraw.receipt.gasUsed * GAS_PRICE);
    });
});
``