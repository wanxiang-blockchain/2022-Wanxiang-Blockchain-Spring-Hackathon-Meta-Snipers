import { Contract, ContractInterface, ethers, Signer } from 'ethers';
// import detectEthereumProvider from "@metamask/detect-provider";
import chainInfo from '@/constants/chainInfo';
const AddChainList = {
  [chainInfo.chainId]: {
    chainId: chainInfo.chainId, // A 0x-prefixed hexadecimal string
    chainName: chainInfo.chainName,
    nativeCurrency: {
      name: chainInfo.chainName,
      symbol: chainInfo.symbol, // 2-6 characters long
      decimals: chainInfo.decimals,
    },
    rpcUrls: [chainInfo.rpc],
    blockExplorerUrls: chainInfo.blockExplorerUrls,
  },
};

import {
  JsonRpcProvider,
  Web3Provider,
  BaseProvider,
} from '@ethersproject/providers';

export interface ChainInfo {
  /**
   * ChainId
   */
  chainId?: string;
  /**
   * RPC
   */
  rpc?: string;
  network?: 'homestead' | 'rinkeby';
}

export interface CallbackParams {
  type: 'accountsChanged' | 'chainChanged';
  value: string;
}

export function isValidKey(
  key: string | number | symbol,
  object: object,
): key is keyof typeof object {
  return key in object;
}
type CallbackFunctionType = (arg0: CallbackParams) => void;

class MyWallet {
  readonly chainInfo: ChainInfo;

  readonly contractAddress: string;
  readonly abi: ContractInterface;

  static isConnect: boolean;
  static listener: CallbackFunctionType | undefined;

  constructor(
    chainInfo: ChainInfo,
    contractAddress: string,
    abi: ContractInterface,
  ) {
    this.chainInfo = chainInfo;
    this.contractAddress = contractAddress;
    this.abi = abi;
  }

  useReadContract(): Contract {
    let provider: BaseProvider | JsonRpcProvider;
    if (this.chainInfo.rpc) {
      provider = new ethers.providers.JsonRpcProvider(this.chainInfo.rpc);
    } else {
      provider = ethers.getDefaultProvider(
        this.chainInfo.network || 'homestead',
      );
    }
    return new ethers.Contract(this.contractAddress, this.abi, provider);
  }

  useWriteContract(): Contract {
    const signer = MyWallet.getSigner();
    return new ethers.Contract(this.contractAddress, this.abi, signer);
  }

  static getSigner() {
    if (isWalletInstalled()) {
      if (!MyWallet.isConnect) {
        this.connect();
        return;
      }
      // const currentProvider = await detectEthereumProvider();

      const provider: Web3Provider = new ethers.providers.Web3Provider(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ethereum,
      );
      const signer: Signer = provider.getSigner();
      return signer;
    } else {
      console.warn('window.ethereum is undefined');
    }
  }

  static async connect(silent = false, switchChainId?: string) {
    if (isWalletInstalled()) {
      if (silent) {
        const isConnected = localStorage.getItem('isConnected');
        if (!isConnected) {
          console.warn("Can't silent connect wallet");
          return;
        }
      }
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        if (switchChainId && chainId !== switchChainId) {
          this.switchChain(switchChainId);
        }

        MyWallet.isConnect = true;

        localStorage.setItem('isConnected', 'true');

        return Promise.resolve({
          account: accounts[0] || '',
          chainId,
        });
      } catch (error) {
        return Promise.reject(error);
      }
    } else {
      console.warn('window.ethereum is undefined');
    }
  }

  static isConnected() {
    return window.ethereum.isConnected();
  }

  static async switchChain(chainId: string, callback?: () => void) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      callback?.();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (error.code === 4902) {
        console.log(error);
        if (isValidKey(chainId, AddChainList)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AddChainList[chainId]],
          });
          callback?.();
        }
      }
    }
  }

  static onEvent(callback: CallbackFunctionType) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!window.ethereum) {
      console.warn('window.ethereum is undefined');
      return;
    }
    this.listener = callback;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ethereum.on('accountsChanged', (accounts) => {
      callback?.({
        type: 'accountsChanged',
        value: accounts[0],
      });
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ethereum.on('chainChanged', (chainId) => {
      callback?.({
        type: 'chainChanged',
        value: chainId,
      });
    });
  }
  static offEvent() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!window.ethereum) {
      console.warn('window.ethereum is undefined');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ethereum.removeListener('accountsChanged', this.listener);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ethereum.removeListener('chainChanged', this.listener);
  }

  static async getNetwork() {
    if (isWalletInstalled()) {
      const provider: Web3Provider = new ethers.providers.Web3Provider(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ethereum,
      );
      const network = await provider.getNetwork();
      return network;
    } else {
      throw new Error('window.ethereum is undefined');
    }
  }
}

export function isWalletInstalled() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Boolean(window.ethereum);
}

export function isMetaMask() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
}

export function isTokenPocket() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Boolean(window.ethereum && window.ethereum.isTokenPocket);
}
export function isImToken() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Boolean(window.ethereum && window.ethereum.isImToken);
}

export default MyWallet;
