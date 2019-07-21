pragma solidity 0.4.24;

contract Funding {
    uint public raised;
    uint public goal;
    address public owner;

    event Donated(uint donation);
    event Withdrew(uint amount);

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    modifier isFinished() {
        require(isFunded());
        _;
    }

    modifier notFinished() {
        require(!isFunded());
        _;
    }

    constructor (uint _goal) public {
        owner = msg.sender;
        goal = _goal;
    }

    function isFunded() public view returns (bool) {
        return raised >= goal;
    }

    function donate() public payable notFinished {
        uint refund;
        raised += msg.value;
        if (raised > goal) {
            refund = raised - goal;
            raised -= refund;
            msg.sender.transfer(refund);
        }
        emit Donated(msg.value);
    }

    function withdraw() public onlyOwner isFinished {
        uint amount = address(this).balance;
        owner.transfer(amount);
        emit Withdrew(amount);
    }
}
