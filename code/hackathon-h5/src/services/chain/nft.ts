import chainInfo from '@/constants/chainInfo';
import { ethers, BigNumber } from 'ethers';
import { sleep } from '@/utils/util';
import MyWallet from '@/utils/wallet';

export const getNftTokenList = (userAddress: string) => {
  console.log(userAddress, 'address');
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftContractAddress,
    chainInfo.nftAbi,
  );
  const reader = wallet.useReadContract();
  return reader.tokenListOfOwner(userAddress, 0);

  //return Promise.resolve(['00001.png', '00002.png']);
};

export const getGrowthAmount = (tokenId: number) => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.nftAbi,
  );
  const reader = wallet.useReadContract();
  return reader.getGrowthAmount(tokenId);

  //return Promise.resolve(['00001.png', '00002.png']);
};

export const getNftMetaData = (tokenId: number) => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftContractAddress,
    chainInfo.nftAbi,
  );
  const reader = wallet.useReadContract();
  return reader.tokenURI(tokenId);

  //return Promise.resolve(['00001.png', '00002.png']);
};

export const getUnhealthyAmount = (tokenId: number) => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.nftAbi,
  );
  const reader = wallet.useReadContract();
  return reader.getUnhealthyAmount(tokenId);

  //return Promise.resolve(['00001.png', '00002.png']);
};

export const getFreeNftTree = () => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.nftAbi,
  );
  const writer = wallet.useWriteContract();
  return writer.getFreeNFT();
};

export const getBuyPrice = () => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.nftAbi,
  );
  const reader = wallet.useReadContract();
  return reader.getPrice();

  //return Promise.resolve(['00001.png', '00002.png']);
};
export const buyNftTree = async (num: number) => {
  console.log(num, 'num');
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.nftAbi,
  );
  const writer = wallet.useWriteContract();
  const price = await writer.getPrice();
  return writer.buy(num, {
    value: price.mul(num), //ethers.utils.parseUnits('4', 14).mul(num),
  });
};
