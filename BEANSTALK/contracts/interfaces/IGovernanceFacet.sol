// SPDX-License-Identifier: UNLICENSED
// !! THIS FILE WAS AUTOGENERATED BY abi-to-sol v0.5.2. SEE SOURCE BELOW. !!
pragma solidity 0.8.10;

interface IGovernanceFacet {
    event Commit(address indexed account, uint32 indexed bip);
    event Incentivization(address indexed account, uint256 beans);
    event Pause(address account, uint256 timestamp);
    event Proposal(
        address indexed account,
        uint32 indexed bip,
        uint256 indexed start,
        uint256 period
    );
    event Unpause(address account, uint256 timestamp, uint256 timePassed);
    event Unvote(address indexed account, uint32 indexed bip, uint256 roots);
    event Vote(address indexed account, uint32 indexed bip, uint256 roots);
    event VoteList(
        address indexed account,
        uint32[] bips,
        bool[] votes,
        uint256 roots
    );

    function activeBips() external view returns (uint32[] memory);

    function bip(uint32 bipId) external view returns (IGovernanceFacetStorage.Bip memory);

    function bipDiamondCut(uint32 bipId)
    external
    view
    returns (IGovernanceFacetStorage.DiamondCut memory);

    function bipFacetCuts(uint32 bipId)
    external
    view
    returns (IDiamondCut.FacetCut[] memory);

    function commit(uint32 bip) external;

    function emergencyCommit(uint32 bip) external;

    function numberOfBips() external view returns (uint32);

    function ownerPause() external;

    function ownerUnpause() external;

    function pauseOrUnpause(uint32 bip) external;

    function propose(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata,
        uint8 _pauseOrUnpause
    ) external;

    function rootsFor(uint32 bipId) external view returns (uint256);

    function unvote(uint32 bip) external;

    function unvoteAll(uint32[] memory bip_list) external;

    function vote(uint32 bip) external;

    function voteAll(uint32[] memory bip_list) external;

    function voteUnvoteAll(uint32[] memory bip_list) external;

    function voted(address account, uint32 bipId) external view returns (bool);
}

interface IGovernanceFacetStorage {
    struct Bip {
        address proposer;
        uint32 start;
        uint32 period;
        bool executed;
        int256 pauseOrUnpause;
        uint128 timestamp;
        uint256 roots;
        uint256 endTotalRoots;
    }

    struct DiamondCut {
        IDiamondCut.FacetCut[] diamondCut;
        address initAddress;
        bytes initData;
    }
}

interface IDiamondCut {
    struct FacetCut {
        address facetAddress;
        uint8 action;
        bytes4[] functionSelectors;
    }
}
