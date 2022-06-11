import { useState } from 'react';
import { useModel } from 'umi';
import styles from './index.less';
import classnames from 'classnames';
import { TextArea, Button, Toast, DotLoading } from 'antd-mobile';
import HighTree from '@/assets/imgs/tree-high.png';
import Energy from '@/assets/imgs/energy.png';
import { buyNftTree, getBuyPrice } from '@/services/chain/nft';
import { updateApi } from '@/services/api';
import IconBack from '@/assets/imgs/icons/icon-back.svg';
import { switchChainCheck } from '@/utils/util';
import chainInfo from '@/constants/chainInfo';
import { EnergyTreeKey } from '@/constants/global';
import { BigNumber, ethers } from 'ethers';
enum Area {
  Africa = 'Australia',
  Spain = 'Spain',
}
const rewards = [
  { des: '稀缺款树NFT', img: HighTree },
  { des: '碳能量 +78500', subDes: '', img: Energy },
];
const Index = () => {
  const [area, setArea] = useState(Area.Africa);
  const [donateNum, setDonateNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wish, setWish] = useState('');
  const { initialState } = useModel('@@initialState');
  const [price, setPrice] = useState(0);
  const { account } = initialState;

  const switchList = [
    { name: Area.Africa, show: '澳大利亚', active: area === Area.Africa },
    { name: Area.Spain, show: '西班牙', active: area === Area.Spain },
  ];
  const donate = () => {
    setLoading(true);
    buyNftTree(donateNum)
      .then(async (tx: any) => {
        try {
          await tx.wait();
          await updateApi({
            address: account,
            type: 2,
            value: donateNum,
          });
          const num = localStorage.getItem(EnergyTreeKey);
          if (num) {
            localStorage.setItem(
              EnergyTreeKey + account,
              String(Number(num) + 78500 * donateNum),
            );
          } else {
            localStorage.setItem(
              EnergyTreeKey + account,
              String(78500 * donateNum),
            );
          }

          setTimeout(() => {
            Toast.show({ icon: 'success', content: '捐赠成功！' });
            history.back();
          }, 3000);
        } catch (e) {
          console.log(e);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };
  useState(() => {
    getBuyPrice().then((price: BigNumber) => {
      setPrice(ethers.utils.formatEther(price));
    });
  }, []);
  return (
    <div className={styles.donate}>
      <div className={classnames(styles.banner, styles[area])}>
        <div className={styles.switch}>
          {switchList.map((v) => {
            return (
              <div
                className={classnames(styles.item, {
                  [styles.active]: v.active,
                })}
                key={v.name}
                onClick={() => {
                  setArea(v.name);
                }}
              >
                {v.show}
              </div>
            );
          })}
        </div>
        <img src={IconBack} className="back" onClick={() => history.back()} />
      </div>
      <div className={styles.main}>
        <div className={styles.form}>
          <div className={styles.numberBox}>
            <div
              className={styles.left}
              onClick={() => {
                if (donateNum > 1) setDonateNum(donateNum - 1);
              }}
            >
              -
            </div>
            <div>{donateNum}</div>
            <div
              className={styles.right}
              onClick={() => {
                setDonateNum(donateNum + 1);
              }}
            >
              +
            </div>
          </div>
          <div className={styles.priceDes}>
            需捐款:{' '}
            {price === 0 ? <DotLoading /> : (price * donateNum).toFixed(4)}
            {chainInfo.symbol}
          </div>
          <div className={styles.wish}>
            <TextArea
              className={styles.wishInput}
              placeholder="请输入寄语"
              maxLength={200}
              rows={4}
              onChange={(v) => {
                setWish(v);
              }}
            />
          </div>
          <div className={styles.option}>
            <Button
              className={styles.buyButton}
              loading={loading || price === 0}
              disabled={loading}
              onClick={() => switchChainCheck(chainInfo.chainId, donate)}
            >
              认养树
            </Button>
          </div>
          <div className={styles.bottomInfo}>
            <div className={styles.title}>捐赠一棵树将获得</div>
            <div className={styles.rewards}>
              {rewards.map((v) => {
                return (
                  <div className={styles.item} key={v.des}>
                    <div className={styles.imgBox}>
                      <img src={v.img} />
                    </div>
                    <div className={styles.des}>{v.des}</div>
                    {v.subDes && (
                      <div className={styles.subDes}>{v.subDes}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.tip}>
              <div className={styles.title}>捐款说明</div>
              <div className={styles.info}>
                捐款金额会在西班牙和澳大利亚真实种植树木。西班牙Alcoroches自然公园2013年遭遇了森林大火，澳大利亚国家公园2019年遭遇了持续5个多月的森林大火。捐款将用于它们的再造林计划。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
