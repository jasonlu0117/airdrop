# Airdrop contract

## 简介

本合约是一个简单的空投合约。在这个合约中，你可以实现设置空投规则，空投时间，领取空投等功能呢。

## 使用用法

### 环境搭建

1. 首先，需要安装 node 和 npm，可以参考 node 的官方文档进行安装。
2. 进入 airdrop-contract 目录，运行 `npm install` 去安装依赖。

### 单元测试

1. 运行 `npx hardhat compile` 命令去编译合约。
2. 运行 `npx hardhat test` 去执行所有单元测试，并检查测试结果。

### 部署

1. 首先，需要准备一个钱包地址用来部署合约，把私钥的值复制到 hardhat.config.js 文件并替换 `PRIVATE_KEY_MANAGER` 的值。
2. 转到 deploy.js 文件，这里为每个合约的部署都准备了一个对应的方法。我们需要按照顺序去部署合约（通过注释掉其他部署函数，只留下需要部署的函数的方法，去按顺序依次执行）。注意每个合约部署完后，需要等待一小段时间，以等待交易状态确认。
3. 注释其他方法，保留 `await deployMockCoboNFT();`，然后运行 `npx hardhat run scripts/deploy.js --network sepolia` 命令去部署 mock 的 coboNFT 合约。并用类似的方法运行 `await deployMockAirdropNFT();` 命令去部署 airdropNFT 合约。
4. 注释其他方法，只保留 `await deployAirdropImplementation();`，然后运行 `npx hardhat run scripts/deploy.js --network sepolia` 命令去部署 AirdropImplementation 合约。 当你在日志中看到合约地址时，记下 AirdropImplementation 合约的地址，并赋值给 `airdropImplementationAddress`。
5. 类似地，注释其他方法，只保留 `await deployAirdrop(airdropImplementationAddress, coboNFTAddress, airdropNFTAddress, startTime, endTime);`。然后运行 `npx hardhat run scripts/deploy.js --network sepolia` 命令去部署 Airdrop 合约，然后记下合约地址。
6. 注意，先不要部署 AirdropImplementationV2 合约。

### 使用交易测试合约

1. 我们可以通过发送交易在sepolia测试网对合约进行测试，你需要再准备两个钱包，替换 hardhat.config.js 文件中的 `PRIVATE_KEY_USER` 和 `PRIVATE_KEY_USER2` 值。
2. 替换 transactions.js 文件中的 `airdropAddress`，`airdropNFTAddress` 和 `coboNFTAddress` 值（用你实际部署的地址值）。
3. 与 deploy.js 脚本类似，我们通过注释其他方法，保留需要执行的方法，去依次执行测试脚本。注意，每当执行完一个交易后，需要等待一段时间，直到交易状态被确认。
4. 这里用一个例子来解释：注释其他方法，保留 `var txn = await coboNFT.mint(manager.address);console.log("txn:", txn);`，然后运行 `npx hardhat run scripts/transactions.js --network sepolia` 命令。得到txnId, 跳转到 Sepolia Explorer 浏览器 (URL: https://sepolia.etherscan.io)，搜索这个txnId，等待交易的状态变为成功。然后再依次执行后面的方法。最终运行 `await airdropNFT.balanceOf(manager.address);` 后可以看到该用户持有的airdropNFT的数量变为了1。
5. 如果你想测试 `setAirdropTime` 方法，可以去 deploy.js 文件，按顺序执行 `await deployAirdropImplementationV2();` and `await updateAirdropImplementation(airdropAddress, airdropImplementationV2Address);` 去更新合约的实现。然后在 transactions.js 里使用 airdropImplementationV2 去执行 `setAirdropTime(uint256 _startTime, uint256 _endTime)` 方法。

### 附录

AirdropImplementation 和 Airdrop 合约我已经部署过了，任何人都可以用以下地址进行测试。

Airdrop合约地址：0x1F23A29864732400A89DE7a5E36c19F9D97B1731

Airdrop合约地址链接：https://sepolia.etherscan.io/address/0x1F23A29864732400A89DE7a5E36c19F9D97B1731