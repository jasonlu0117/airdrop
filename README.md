# Airdrop project

## 1. 简介

本项目是一个空投项目完整解决方案。项目包括空投合约，后端 api 服务，event 事件监听服务。它们的作用分别是：

1. 空投合约：用来定制空投规则，时间条件，领取空投。
2. 后端 api 服务：用来提供 api 服务，以供用户查询某个地址是否有权限领取空投；以及查询空投活动总共的 NFT 数量及已经被领取的个数。
3. event 事件监听服务：用来监听领取空投的 event 事件，并把事件中的用户地址和 NFT tokenId 记录到 mongoDB 或者其他的存储，以供我们对结果进行分析。

## 2. 环境搭建

1. 首先，需要安装 node 和 npm，可以参考 node 的官方文档进行安装。
2. 进入 airdrop-contract 目录，运行 `npm install` 去安装依赖。
3. 进入 airdrop-service 目录，运行 `npm install` 去安装依赖。

## 3. 导航

1. 合约部分可以参考 4.1 部分。文档中解释了合约的用法和测试方法。另外，完整的合约代码、单元测试代码、部署脚本、测试脚本都在 airdrop-contract 项目下。
2. API部分可以参考 4.2.2 部分。文档解释了该 api 服务的启动和使用方法。完整的代码在 airdrop-service/public/api-service 下。
3. 记录后端访问数据部分可以参考 4.2.3 部分。文档解释了如何去记录领取空投的数据的方式。完整的代码在 airdrop-service/public/event-handler 下。
4. 安全分析可以参考 5. 部分。文档中分析了可能的风险，并给出了解决方案。并已经在合约（以及V2合约）代码中实现。
5. 吞吐量设计参加 6. 部分。文档给出了对吞吐量优化的方案。

## 4. 使用用法

### 4.1 airdrop-contract 项目

#### 4.1.1 简介

airdrop-contract 项目分为 contracts，test，scripts 这几个模块。

1. contracts：包含了 airdrop 合约的完整代码，是一个可升级的合约，分为 airdrop 和 airdropImplementation（以及airdropImplementationV2）。
2. test：包含了 airdrop 合约的所有单元测试代码。
3. scripts：包含了部署脚本 deploy.js 和发送交易测试的脚本 transaction.js。

#### 4.1.2 单元测试

1. 进入 airdrop-contract 项目，打开命令行工具。
2. 运行 `npx hardhat compile` 命令去编译合约。
3. 运行 `npx hardhat test` 去执行所有单元测试，并检查测试结果。

#### 4.1.3 部署

1. 首先，需要准备一个钱包地址用来部署合约，把私钥的值复制到 hardhat.config.js 文件并替换 `PRIVATE_KEY_MANAGER` 的值。
2. 转到 deploy.js 文件，这里为每个合约的部署都准备了一个对应的方法。我们需要按照顺序去部署合约（通过注释掉其他部署函数，只留下需要部署的函数的方法，去按顺序依次执行）。注意每个合约部署完后，需要等待一小段时间，以等待交易状态确认。
3. 注释其他方法，保留 `await deployMockCoboNFT();`，然后运行 `npx hardhat run scripts/deploy.js --network sepolia` 命令去部署 mock 的 coboNFT 合约。并用类似的方法运行 `await deployMockAirdropNFT();` 命令去部署 mock 的 airdropNFT 合约。
4. 注释其他方法，只保留 `await deployAirdropImplementation();`，然后运行 `npx hardhat run scripts/deploy.js --network sepolia` 命令去部署 AirdropImplementation 合约。 当你在日志中看到合约地址时，记下 AirdropImplementation 合约的地址，并赋值给 `airdropImplementationAddress`。
5. 类似地，注释其他方法，只保留 `await deployAirdrop(airdropImplementationAddress, coboNFTAddress, airdropNFTAddress, startTime, endTime);`。然后运行 `npx hardhat run scripts/deploy.js --network sepolia` 命令去部署 Airdrop 合约，然后记下合约地址。
6. 注意，先不要部署 AirdropImplementationV2 合约。

#### 4.1.4 通过发交易测试合约

1. 我们可以通过发送交易在 sepolia 测试网对合约进行测试，你需要再准备两个钱包，替换 hardhat.config.js 文件中的 `PRIVATE_KEY_USER` 和 `PRIVATE_KEY_USER2` 值。
2. 替换 transactions.js 文件中的 `airdropAddress`，`airdropNFTAddress` 和 `coboNFTAddress` 值（用你实际部署的地址值）。
3. 与 deploy.js 脚本类似，我们通过注释其他方法，保留需要执行的方法，去依次执行测试脚本。注意，每当执行完一个交易后，需要等待一段时间，直到交易状态被确认。
4. 这里用一个例子来解释：注释其他方法，保留 `var txn = await coboNFT.mint(manager.address);console.log("txn:", txn);`，然后运行 `npx hardhat run scripts/transactions.js --network sepolia` 命令。得到txnId, 跳转到 Sepolia Explorer 浏览器 (URL: https://sepolia.etherscan.io)，搜索这个txnId，等待交易的状态变为成功。然后再依次执行后面的方法。最终运行 `await airdropNFT.balanceOf(manager.address);` 后可以看到该用户持有的airdropNFT的数量变为了1。
5. 如果你想测试 `setAirdropTime` 方法，可以去 deploy.js 文件，按顺序执行 `await deployAirdropImplementationV2();` and `await updateAirdropImplementation(airdropAddress, airdropImplementationV2Address);` 去更新合约的实现。然后在 transactions.js 里使用 airdropImplementationV2 去执行 `setAirdropTime(uint256 _startTime, uint256 _endTime)` 方法。

#### 4.1.5 附录

AirdropImplementation 和 Airdrop 合约我已经部署过了，任何人都可以用以下地址进行测试。

Airdrop合约地址：0x1F23A29864732400A89DE7a5E36c19F9D97B1731

Airdrop合约地址链接：https://sepolia.etherscan.io/address/0x1F23A29864732400A89DE7a5E36c19F9D97B1731

### 4.2 airdrop-service 项目

#### 4.2.1 简介

airdrop-service 项目分为 api-service 和 event-handler 这两个服务。

1. api-service：是一个简单的 web 服务。用来启动一个 web 服务，让用户能通过调用接口的方式，查询某个地址是否有权限领取空投；以及查询空投活动总共的 NFT 数量及已经被领取的个数。
2. event-handler：是一个监听合约 event 事件的服务。用来启动一个 event 事件监听服务，一旦有用户领取空投，合约将会发送一个 event 事件，接着 event-handler 服务会监听这个 event 事件，并把事件中的用户地址和 NFT tokenId 记录到 mongoDB 或者其他的存储，以供我们对结果进行分析。

#### 4.2.2 使用 api-service

1. 转到 api-service 文件，根据合约项目中 RPC URL 和合约地址，去替换 `new Web3()` 和 `contractAddress` 的值，并用合约项目中的 `artifacts/contracts/AirdropImplementation.sol/AirdropImplementation.json` 文件下的 abi 来替换这里的 abi 的值。
2. 运行 `node api-service.js` 命令启动 api 服务。
3. 用 postman 或者其他 http 请求工具，发送请求到 `http://localhost:3000/checkAirdrop/<address>` 去检查这个 address 是否有权领取空投。再发请求到 `http://localhost:3000/checkAirdropNums` 去检查空投活动总共的 NFT 数量和已经被领取的个数。

#### 4.2.3 使用 event-handler

1. 转到 event-handler 文件，根据合约项目中 RPC URL 和合约地址，去替换 `new Web3()` 和 `contractAddress` 的值，并用合约项目中的 `artifacts/contracts/AirdropImplementation.sol/AirdropImplementation.json` 文件下的 abi 来替换这里的 abi 的值。
2. 运行 `node event-handler.js` 命令启动 event 监听服务。
3. 跳转到合约项目中的 `scripts/transactions.js` 文件，保留 `var txn = await airdropImplementation.claimAirdrop();console.log("txn:", txn);` 命令并执行。再跳转回 event-handler 中，你将会在 event-handler 日志中出现 `user: xxxxx, tokenId: xxxxx` 和 `store events in MongoDB or other storage, allowing us to analyze this data to evaluate the airdrop's effectiveness` 的内容，这说明在 event-handler 中，我们已经成功监听到了抛出的 event 事件。可以将事件记录到 mongoDB 或者其他存储中。之后，可以对这些数据进行分析，以了解空投的效果。

### 4.3 使用方法总结

1. 首先按照 airdrop-contract 部分的文档，先部署 airdrop 合约到 sepolia 测试网（也可以直接使用我已经部署好的，合约地址参数上面的文档）。
2. 再到 airdrop-service 项目中，按照文档启动 api-service 和 event-handler 服务。
3. 开始完整流程的测试：
    1) 测试用户调用 api-service 的 checkAirdrop 接口，可以看到返回 false。再调用 checkAirdropNums 接口，看到返回的 current 和 total 值。
    2) 使用 transactions.js 脚本，发送 mint 交易，给测试用户 mint CoboNFT。
    3) 再次调用 api-service 的 checkAirdrop 接口，可以看到返回了 true。
    4) 使用 transactions.js 脚本，发送 mint 交易，给部署合约的用户 mint AirdropNFT。并发送 depositAirdropNFTs 交易，将 AirdropNFT 存入 airdrop-contract 合约中。
    5) 使用 transactions.js 脚本，发送 claimAirdrop 交易。然后转到 event-handler 中查看日志，可以看到 event-handler 接收到了 event 事件，并会把事件存到数据库。调用 api-service 的 checkAirdrop 接口，可以看到返回为 false 了，再调用 checkAirdropNums 接口，看到返回的 current 值比之前加1了。
    6) 使用 transactions.js 脚本，发送 airdropNFT.balanceOf 交易。可以查到测试用户持有的 airdropNFT 数量变成了1。

测试的一些效果，也可以参考screenshots目录下的截图。

## 5. 安全风险分析

针对空投合约，可能出现的安全风险如下：

1. 重入攻击：指在执行合约函数时，恶意合约可以在函数结束前再次调用该函数，导致重复执行某些操作（如多次领取空投）。

解决：通过在合约中 claimAirdrop 方法上加 nonReentrant，可以防止该风险。

2. 权限漏洞：未经授权的用户可能会调用受限函数，从而操作合约状态或资产。

解决：在合约中，对重要的方法，都加了权限验证 onlyOwner。

3. 时间漏洞：矿工可能通过操纵区块时间戳来影响空投的时间条件，导致空投在错误的时间进行。

解决：设置了空投的开始、结束时间。并使用了 onlyDuringAirdrop 在领取空投前进行验证。

4. DDOS攻击：恶意用户可能通过频繁调用合约函数，导致合约耗尽资源或被阻塞，影响其他用户的正常操作。

解决：在合约中加上 rate limit 限制，来进行限速。可查看 AirdropImplementationV2 合约实现代码，已加上速率限制。

5. 整数溢出或下溢：计算过程中可能会超出整数的最大值和最小值，导致意料之外的问题。

解决：合约中使用了 OpenZeppline 提供的 SafeMath 库来处理。

5. 其他漏洞：可能存储一些其他暂时没有发现的漏洞。

解决：合约是可升级合约，我们可以通过编写新的合约实现，去更新合约，且保持合约的地址和状态不变。以修复漏洞。

## 6. 吞吐量设计

目前在该项目中，是由前端去调用合约的 claimAirdrop 方法去领取空投的。因此我们可以考虑以下吞吐量的优化方法：

1. 在前端使用 MQ，通过 MQ 去接收用户领取空投的请求，再调用时从 MQ 中取出请求，并调用合约方法。靠 MQ 对尖峰流量进行削峰。
2. 在合约中加上 rate limit 限制，当达到一定量级时进行限速。可查看 AirdropImplementationV2 合约实现代码，已加上速率限制。