# Airdrop service

## 简介

本仓库包含两个服务。一个是 api-service 服务，用来启动一个 web 服务，让用户能通过调用接口的方式，查询某个地址是否有权限领取空投；以及查询空投活动总共的 NFT 数量及已经被领取的个数。另一个是 event-handler 服务，用来启动一个 event 事件监听服务，一旦有用户领取空投，合约将会发送一个 event 事件，接着 event-handler 服务会监听这个 event 事件，并把事件中的用户地址和 NFT tokenId 记录到 mongoDB 或者其他的存储，以供我们对结果进行分析。

## 使用用法

### 环境搭建

1. 首先，需要安装 node 和 npm，可以参考 node 的官方文档进行安装。
2. 进入 airdrop-service 目录，运行 `npm install` 去安装依赖。

### 使用 api-service

1. 转到 api-service 文件，根据合约项目中 RPC URL 和合约地址，去替换 `new Web3()` 和 `contractAddress` 的值，并用合约项目中的 `artifacts/contracts/AirdropImplementation.sol/AirdropImplementation.json` 文件下的 abi 来替换这里的 abi 的值。
2. 运行 `node api-service.js` 命令启动 api 服务。
3. 用 postman 或者其他 http 请求工具，发送请求到 `http://localhost:3000/checkAirdrop/<address>` 去检查这个 address 是否有权领取空投。再发请求到 `http://localhost:3000/checkAirdropNums` 去检查空投活动总共的 NFT 数量和已经被领取的个数。

### 使用 event-handler

1. 转到 event-handler 文件，根据合约项目中 RPC URL 和合约地址，去替换 `new Web3()` 和 `contractAddress` 的值，并用合约项目中的 `artifacts/contracts/AirdropImplementation.sol/AirdropImplementation.json` 文件下的 abi 来替换这里的 abi 的值（可以只复制event部分）。
2. 运行 `node event-handler.js` 命令启动 event 监听服务。
3. 跳转到合约项目中的 `scripts/transactions.js` 文件，保留 `var txn = await airdropImplementation.claimAirdrop();console.log("txn:", txn);` 命令并执行。再跳转回 event-handler 中，你将会在 event-handler 日志中出现 `user: xxxxx, tokenId: xxxxx` 和 `store events in MongoDB or other storage, allowing us to analyze this data to evaluate the airdrop's effectiveness` 的内容，这说明在 event-handler 中，我们已经成功监听到了抛出的 event 事件。可以将事件记录到 mongoDB 或者其他存储中。之后，可以对这些数据进行分析，以了解空投的效果。
