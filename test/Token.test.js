const Token = artifacts.require('./Token');

contract('Token', (accounts) => {
    let token

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it('tracks the name', async () => {

            const token = await Token.new();
            const result = await token.name();

            assert.equal(result, "Imba Token", "Name is not tracked.");

        })

        it('tracks the symbol', async () => {
            
        })

    })

})