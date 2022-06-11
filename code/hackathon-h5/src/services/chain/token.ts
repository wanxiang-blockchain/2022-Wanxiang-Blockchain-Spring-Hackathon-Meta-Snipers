import chainInfo from '@/constants/chainInfo';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import MyWallet from '@/utils/wallet';
import { burnToken } from '@/services/api';

interface GetTokenBalanceF {
  (userAddress: string): Promise<BigNumber>;
}
export const getTokenBalance: GetTokenBalanceF = (userAddress: string) => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.carbonEnergyAddress,
    chainInfo.tokenAbi,
  );
  const reader = wallet.useReadContract();

  return reader.balanceOf(userAddress);
};

export const watering = async (
  tokenId: number,
  wateringAmount: number,
  userAddress: string,
) => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.tokenAbi,
  );

  const approveWallet = new MyWallet(
    chainInfo,
    chainInfo.carbonEnergyAddress,
    chainInfo.tokenAbi,
  );

  const approveWrite = approveWallet.useWriteContract();

  const writer = wallet.useWriteContract();
  const approvedNum = await approveWrite.allowance(
    userAddress,
    chainInfo.nftGameContractAddress,
  );
  console.log(approvedNum, 'approve', tokenId, wateringAmount);
  const num = parseFloat(ethers.utils.formatEther(approvedNum));
  console.log(num, 'num');

  if (num === 0) {
    const approveNum = ethers.utils.parseUnits('9999999999999', 18);

    await approveWrite.approve(chainInfo.nftGameContractAddress, approveNum);
  }

  return burnToken({
    address: userAddress,
    tokenId: tokenId,
    value: wateringAmount,
  });
};

export const attack = (address: string, tokenId: number, amount: number) => {
  const wallet = new MyWallet(
    chainInfo,
    chainInfo.nftGameContractAddress,
    chainInfo.nftAbi,
  );
  const writer = wallet.useWriteContract();
  return writer.attack(address, tokenId, amount);
};
