import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Proxy.sol";

pragma solidity 0.8.9;

contract AirdropImplementation is ProxyStorage, ReentrancyGuard {
    using SafeMath for uint256;

    IERC721 public coboNFT;
    IERC721 public airdropNFT;
    uint256 public airdropStartTime;
    uint256 public airdropEndTime;
    mapping(address => bool) public hasClaimed;

    uint256 public nextAirdropTokenId;
    uint256 public totalDepositedNFTs;
    address public manager;

    event AirdropClaimed(address indexed user, uint256 tokenId);

    function initialize(address _coboNFT, address _airdropNFT, uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(manager == address(0), "Already initialized");
        manager = msg.sender;
        coboNFT = IERC721(_coboNFT);
        airdropNFT = IERC721(_airdropNFT);
        airdropStartTime = _startTime;
        airdropEndTime = _endTime;
        nextAirdropTokenId = 0; // Initialize the next tokenId for airdrop NFTs
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
        require(nextAirdropTokenId < totalDepositedNFTs, "Not enough NFTs for airdrop");

        uint256 tokenIdToTransfer = nextAirdropTokenId;
        nextAirdropTokenId++;

        airdropNFT.transferFrom(address(this), msg.sender, tokenIdToTransfer);

        hasClaimed[msg.sender] = true;
        emit AirdropClaimed(msg.sender, tokenIdToTransfer);
    }
    
}