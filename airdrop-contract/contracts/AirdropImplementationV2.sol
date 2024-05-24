import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Proxy.sol";

pragma solidity 0.8.9;

contract AirdropImplementationV2 is ProxyStorage, ReentrancyGuard {
    using SafeMath for uint256;

    IERC721 public coboNFT;
    IERC721 public airdropNFT;
    uint256 public airdropStartTime;
    uint256 public airdropEndTime;
    mapping(address => bool) public hasClaimed;
    mapping(address => mapping(uint256 => uint256)) public claimedInTimePeriod;

    uint256 public nextAirdropTokenId;
    uint256 public totalDepositedNFTs;
    address public manager;
    uint256 public claimLimit; // Maximum NFTs that can be claimed per time period
    uint256 public timePeriod; // Duration of the time period in seconds

    event AirdropClaimed(address indexed user, uint256 tokenId);

    function initialize(address _coboNFT, address _airdropNFT, uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(manager == address(0), "Already initialized");
        manager = msg.sender;
        coboNFT = IERC721(_coboNFT);
        airdropNFT = IERC721(_airdropNFT);
        airdropStartTime = _startTime;
        airdropEndTime = _endTime;
        nextAirdropTokenId = 1; // Initialize the next tokenId for airdrop NFTs
    }

    modifier onlyDuringAirdrop() {
        require(block.timestamp >= airdropStartTime && block.timestamp <= airdropEndTime, "Airdrop not active");
        _;
    }

    function depositAirdropNFTs(uint256[] calldata tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            airdropNFT.transferFrom(msg.sender, address(this), tokenIds[i]);
        }
        totalDepositedNFTs += tokenIds.length;
    }

    function canClaimAirdrop(address _user) external view returns (bool) {
        return coboNFT.balanceOf(_user) > 0 && !hasClaimed[_user];
    }

    function claimAirdrop() external nonReentrant onlyDuringAirdrop {
        require(coboNFT.balanceOf(msg.sender) > 0, "Not a COBO NFT holder");
        require(!hasClaimed[msg.sender], "Airdrop already claimed");
        require(nextAirdropTokenId <= totalDepositedNFTs, "Not enough NFTs for airdrop");

        uint256 currentTimePeriod = getCurrentTimePeriod();
        require(claimedInTimePeriod[msg.sender][currentTimePeriod] < claimLimit, "Claim limit reached for this time period");

        uint256 tokenIdToTransfer = nextAirdropTokenId;
        nextAirdropTokenId++;

        airdropNFT.transferFrom(address(this), msg.sender, tokenIdToTransfer);

        claimedInTimePeriod[msg.sender][currentTimePeriod]++;
        hasClaimed[msg.sender] = true;
        emit AirdropClaimed(msg.sender, tokenIdToTransfer);
    }
    
    function setAirdropTime(uint256 _startTime, uint256 _endTime) external onlyOwner {
        airdropStartTime = _startTime;
        airdropEndTime = _endTime;
    }

    function setClaimLimit(uint256 _claimLimit) external onlyOwner {
        claimLimit = _claimLimit;
    }

    function setTimePeriod(uint256 _timePeriod) external onlyOwner {
        timePeriod = _timePeriod;
    }

    function getCurrentTimePeriod() public view returns (uint256) {
        return block.timestamp / timePeriod;
    }

}