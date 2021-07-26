
const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('../client/node_modules/chai')
    .use(require('../client/node_modules/chai-as-promised'))
    .should()


const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')        
    );
};

const tokens = (n) => ether(n)

const EVM_REVERT = 'VM Exception while processing transaction: revert';
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let token
    let exchange
    const feePercent = 10

    beforeEach(async () => {
        //deploy token
        token = await Token.new();
        exchange = await Exchange.new(feeAccount, feePercent); 
        token.transfer(user1, tokens(100), {from : deployer})       
    })

    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount()
            result.toString().should.equal(feeAccount.toString())
        })

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })


    })

    describe('depositing Ether', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({from: user1, value: amount})
        })

        it('tracks the ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())
        })

        it('emits a Deposit event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Deposit');
            const event  = log.args
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct');
            event.user.should.equal(user1, 'user1 address is correct');
            event.amount.toString().should.equal(ether(1).toString(), 'value is correct')
            event.balance.toString().should.equal(ether(1).toString(), 'balance is correct')
        })

    })

    describe('Withdraw Ether', () => {
        let result
        let amount
        let balance

        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({from: user1, value: amount})
        })

        describe('success', () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, {from: user1})
            })


            it('Withdraw ether funds', async () => {
                balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })

            it('emits a Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Withdraw');
                const event  = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token address is correct');
                event.user.should.equal(user1, 'user1 address is correct');
                event.amount.toString().should.equal(ether(1).toString(), 'value is correct')
                event.balance.toString().should.equal(ether(0).toString(), 'balance is correct')
            })

        })

        describe('failure', () => {

            it('rejects Withdraw for insufficient balances', async () => {
                await exchange.withdrawEther(ether(100), {from: user1})
                    .should.be.rejectedWith(EVM_REVERT);
            })

        })


    })


    describe('depositing tokens', () => {
        let result
        let amount = tokens(10)

        describe('success', () => {
            beforeEach(async () => {
                await token.approve(exchange.address, amount, {from: user1 });
                result = await exchange.depositToken(token.address, tokens(10), {from: user1})
            })

            it('tracks the token deposit', async () => {
                let balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Deposit');
                const event  = log.args
                event.token.should.equal(token.address, 'token address is correct');
                event.user.should.equal(user1, 'user1 address is correct');
                event.amount.toString().should.equal(tokens(10).toString(), 'value is correct')
                event.balance.toString().should.equal(tokens(10).toString(), 'balance is correct')
    
            })

        })

        describe('failure', () => {
            it('rejects Ether Deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1})
                    .should.be.rejected;                 
            })

            it('no tokens approved', async () => {
                await exchange.depositToken(token.address, tokens(10), {from: user1})
                    .should.be.rejected;                 
            })
        })

    })

    describe('depositing tokens', () => {
    let result
    let amount = tokens(10)

        it('reverts when ether is sent', async () => {
            await exchange.sendTransaction({value: 1, from: user1})
                .should.be.rejectedWith(EVM_REVERT)
        })

    })


})