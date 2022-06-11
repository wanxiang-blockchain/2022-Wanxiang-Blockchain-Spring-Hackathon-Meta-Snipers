import MyWallet from '@/utils/wallet';

export const switchChainCheck = (
  chainId: string,
  callback: (() => void) | undefined,
) => {
  try {
    MyWallet.switchChain(chainId, callback);
  } catch (error) {
    console.log(error);
  }
};
export const isMetaForestClient = () => {
  return navigator.userAgent.includes('MetaForest');
};

export const isDev = process.env.NODE_ENV === 'development';

export const isNumber = (v: any) => {
  return Object.prototype.toString.call(v) === '[object Number]';
};

export const sleep = async (second: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, second * 1000);
  });
};

export const addressShow = (address: any, num: number = 8) => {
  address = String(address);
  if (!address) return '';
  return address.replace(address.slice(num + 2, 0 - num), '...');
};
