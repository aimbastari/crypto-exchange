const Token = artifacts.require('./Token');

require('../client/node_modules/chai')
    .use(require('../client/node_modules/chai-as-promised'))
    .should()

const tokens = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')        
    );
    
};

const EVM_REVERT = 'VM Exception while processing transaction: revert';

contract('Token', ([deployer, receiver, exchange]) => {
    let token

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it('tracks the name', async () => {
            const result = await token.name();
            assert.equal(result, "Imba Token", "Name is not tracked.");
        })

        it('tracks the symbol', async () => {
            const result = await token.symbol();
            assert.equal(result, "IMBA", "Symbol is not tracked.");
        })

        it('tracks the decimal', async () => {
            const result = await token.decimals();
            assert.equal(result, 18, "Decimal is not correct.");
        })

        it('tracks the total supply', async () => {
            const result = await token.totalSupply();
            assert.equal(result.toString(), tokens(1000000).toString(), "Total Supply is not correct.");
        })
        
        it('assigns the total supply to the deployer', async () => {
            const result = await token.balanceOf(deployer);
            assert.equal(result.toString(), tokens(1000000).toString(), "Total Supply not assigned to deployer.");
        })

    })

    describe('sending tokens', () => {
        let result;
        let amount;


        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transfer(receiver, amount, {from: deployer});
            })

            it('transfers token balances', async () => {
                let balanceOf;
    
                //After transfer
                balanceOf = await token.balanceOf(deployer);
                assert.equal(balanceOf.toString(), tokens(999900).toString() )
                balanceOf = await token.balanceOf(receiver);
                assert.equal(balanceOf.toString(), tokens(100).toString() )
    
            })
    
            it('emits a transfer event', ()=> {
                const log = result.logs[0]
                log.event.should.eq('Transfer');
                const event  = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
    
            })
    
    
        })

        describe('failure', () => {
            it('rejects insufficient balance', async () => {
                let invalidAmount
                invalidAmount = tokens(100000000)// 100million
                await token.transfer(receiver, invalidAmount, {from: deployer})
                    .should.be.rejectedWith(EVM_REVERT);
   
                invalidAmount = tokens(10)// receiver has no funds
                await token.transfer(deployer, invalidAmount, {from: receiver})
                    .should.be.rejectedWith(EVM_REVERT);
    
            })

            it('rejects invalid recipients', async () => {
                await token.transfer(0x0, tokens(1), { from: deployer})
                    .should.be.rejected;
            })


        })

    })

    describe('approving tokens', () => {
        let result;
        let amount;

        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.approve(exchange, amount, {from: deployer});
            })

            it('allocates an allowance for delegated token spending', async () => {
                const allowance = await token.allowance(deployer, exchange)
                assert.equal(allowance.toString(), amount.toString(), "Allowance is not correct")   
    
            })
        
            it('emits a approval event', ()=> {
                const log = result.logs[0]
                log.event.should.eq('Approval');
                const event  = log.args
                event.owner.toString().should.equal(deployer, 'owner is correct')
                event.spender.toString().should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
    
            })
        })

        describe('failure', () => {
            it('rejects invalid spenders', async () => {
                await token.approve(0x0, amount, {from: deployer})
                    .should.be.rejected;

            })

        })

    })


    describe('delegated token transfers', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, {from: deployer})

        })

        describe('success', async () => {
            beforeEach(async () => {
                result = await token.transferFrom(deployer, receiver, amount, {from:exchange});
            })

            it('transfers token balances', async () => {
                let balanceOf;
    
                //After transfer
                balanceOf = await token.balanceOf(deployer);
                assert.equal(balanceOf.toString(), tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver);
                assert.equal(balanceOf.toString(), tokens(100).toString())
            })
    
            it('resets the allowance', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0');
            })

            it('emits a transfer event', ()=> {
                const log = result.logs[0]
                log.event.should.eq('Transfer');
                const event  = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')    
            })    
    
        })

        describe('failure', () => {            
            it('rejects insufficient balance', async () => {
                let invalidAmount
                invalidAmount = tokens(100000000)// 100million
                await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange})
                    .should.be.rejected;
   
                invalidAmount = tokens(10)// receiver has no funds
                await token.transferFrom(receiver, invalidAmount, {from: exchange})
                    .should.be.rejected;
    
            })

            it('rejects invalid recipients', async () => {
                await token.transferFrom(0x0, tokens(1), { from: exchange})
                    .should.be.rejected;
            })


        })


    })

    

})