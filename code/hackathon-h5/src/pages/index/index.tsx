import styles from './index.less';
import wallet from '@/utils/wallet';
import { Button, DotLoading, Toast } from 'antd-mobile';
import { useEffect, useState, useRef } from 'react';
import { useModel } from 'umi';
import ConnectWallet from './components/ConnectWallet';
import chainInfo from '@/constants/chainInfo';
import { getNftTokenList } from '@/services/chain/nft';
import { ethers, BigNumber } from 'ethers';
import Main from './components/Main';
import GetFreeNft from './components/GetFreeNft';
import { getFreeNftTree as getFreeNftTreeApi } from '@/services/chain/nft';
import { loginApi } from '@/services/api';
import { switchChainCheck } from '@/utils/util';
import { FreeNftTokenMax } from '@/constants/global';

enum FreeNftStatus {
  UnInit = -1,
  NotGet = 0,
  Geted = 1,
}
const Index = () => {
  const { initialState, loading, error, refresh, setInitialState } = useModel(
    '@@initialState',
  );

  const [nftTokenIdList, setNftTokenIdList] = useState<Array<number>>([]);
  const [freeNftStatus, setFreeNftStatus] = useState(FreeNftStatus.UnInit);

  const [getting, setGetting] = useState(false);
  const { account, latestEmission } = initialState;

  const connect = () => {
    wallet.connect(false, chainInfo.chainId).then(async (info) => {
      let obj = info;
      const { data } = await loginApi({
        address: info.account,
      });
      if (data) obj = Object.assign(obj, data);
      setInitialState(obj);
    });
  };

  const queryTokenList = () => {
    getNftTokenList(account).then((v: any) => {
      const tokenList: Array<BigNumber> = v[0];
      console.log(tokenList);
      const _tokenList: Array<number> = tokenList.map((v) => {
        return v.toNumber();
      });
      setNftTokenIdList(_tokenList);
      const hasFreeArray = _tokenList.filter((v) => {
        return v > FreeNftTokenMax;
      });
      console.log(_tokenList, hasFreeArray);
      setFreeNftStatus(
        hasFreeArray.length === 0 ? FreeNftStatus.NotGet : FreeNftStatus.Geted,
      );
    });
  };

  const getFreeNftTree = () => {
    setGetting(true);
    getFreeNftTreeApi()
      .then(async (tx: any) => {
        await tx.wait();
        setTimeout(() => {
          //wait for query the tree
          if (account) queryTokenList();
        }, 5000);
      })
      .catch((e) => {
        console.log(e);
        setGetting(false);
      });
  };

  useEffect(() => {
    if (account) queryTokenList();
  }, [account]);

  return !account ? (
    <ConnectWallet connect={connect} />
  ) : (
    <div className={styles.main}>
      {freeNftStatus === FreeNftStatus.UnInit ? (
        <div className={styles.loading}>
          <DotLoading color="#fff" className={styles.dot} />
        </div>
      ) : freeNftStatus === FreeNftStatus.NotGet ? (
        <GetFreeNft
          account={account}
          latestEmission={latestEmission}
          getFreeNftTree={() =>
            switchChainCheck(chainInfo.chainId, getFreeNftTree)
          }
          loading={getting}
        />
      ) : (
        <Main account={account} nftTokenIdList={nftTokenIdList} />
      )}
    </div>
  );
};

export default Index;
