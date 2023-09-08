const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    // const sendValue = "100000000000000000"
    const sendValue = ethers.utils.parseEther("1")


    beforeEach(async function () {
        //deploy fundme contract using hardhat deploy
        // const accounts =awwait ethers.getSigners()
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer

        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer) //Gets the fundme deployed contract
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", function () {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    
    describe("fund", async function(){
        it("Failed if you don't send enought ETH", async function(){
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )

        })
        it("updates the amount funded data structure", async function(){
            await fundMe.fund({value:sendValue })
            const response = await fundMe.getAddressToAmountFunded(
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funders to array of funders", async function(){
            await fundMe.fund({value:sendValue})
            const funder = await fundMe.getFunders(0)
            assert.equal(funder,deployer)
        })

    })
    describe("withdraw", async function (){
        beforeEach(async function(){
            await fundMe.fund({value:sendValue})
        })

        it("withdraw ETH from single founder", async function(){
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //ACT
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //Assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("Cheaper withdraw ETH from single founder", async function(){
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //ACT
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //Assert
            assert.equal(endingFundMeBalance,0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("allows us to withdraw with multiple funders", async function(){
            //Arrange
            const accounts = await ethers.getSigners()
            for(let i=1;i<6;i++){
                //There we have connected fund me only with one account that is deployer account now we are gouing to connect with it many 
                //other accounts.. we can do this by using .connect it will add more account in object of accounts
                const fundMeConnectedContract= await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value: sendValue})
            }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const {gasUsed, effectiveGasPrice} = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                //Assert
                assert.equal(endingFundMeBalance,0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
                )

                //Make sure funders are reset properly
                await expect(fundMe.getFunders(0)).to.be.reverted

                for (i=1;i<6;i++){
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
                }

            })

            it("Only allows owner to withdraw", async function(){
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")

            })


            it("cheaper withdraw testing....", async function(){
                //Arrange
                const accounts = await ethers.getSigners()
                for(let i=1;i<6;i++){
                    //There we have connected fund me only with one account that is deployer account now we are gouing to connect with it many 
                    //other accounts.. we can do this by using .connect it will add more account in object of accounts
                    const fundMeConnectedContract= await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({value: sendValue})
                }
                    const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                    const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
    
                    //Act
                    const transactionResponse = await fundMe.cheaperWithdraw()
                    const transactionReceipt = await transactionResponse.wait(1)
                    const {gasUsed, effectiveGasPrice} = transactionReceipt
                    const gasCost = gasUsed.mul(effectiveGasPrice)
    
                    const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                    const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
    
                    //Assert
                    assert.equal(endingFundMeBalance,0)
                    assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                    )
    
                    //Make sure funders are reset properly
                    await expect(fundMe.getFunders(0)).to.be.reverted
    
                    for (i=1;i<6;i++){
                        assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)
                    }
    
                })
            it("Receive is working properly", async function(){
                const [deployerb] = await ethers.getSigners();
                const initialBalance = await fundMe.provider.getBalance(fundMe.address)
                await deployerb.sendTransaction({ to: fundMe.address, value: sendValue });
                const finalBalance = await fundMe.provider.getBalance(fundMe.address)
                assert.equal(initialBalance.add(sendValue).toString(), finalBalance.toString())
            })
            
        })
})







