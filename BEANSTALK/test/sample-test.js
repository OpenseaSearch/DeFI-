const { expect } = require("chai");
const { ethers } = require("hardhat");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

describe("BeanExploit", function () {
  it("开始", async function () {
    const BeanExploit = await ethers.getContractFactory("BeanExploit");
    const beanExploit = await BeanExploit.deploy();
    await beanExploit.deployed();

    console.log("beanExploit address: ",beanExploit.address);


    // await beanExploit.getBalance();

    await beanExploit.exploit();

    // await beanExploit.getBalance();

    

  });
});
