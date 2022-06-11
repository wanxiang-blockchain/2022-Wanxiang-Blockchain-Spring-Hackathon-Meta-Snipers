import styles from './index.less';
import { Swiper, List, DotLoading, Toast } from 'antd-mobile';
import { SwiperRef } from 'antd-mobile/es/components/swiper';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import dayjs from 'dayjs';
import {
  list,
  getLevel,
  EnergyTreeKey,
  EnergyWalkKey,
} from '@/constants/global';
import { addressShow } from '@/utils/util';
import IconMy from '@/assets/imgs/icons/icon-my-step.svg';
import TreeImg from '@/assets/imgs/trees/tree-1-large.png';
import classnames from 'classnames';
import IconTree from '@/assets/imgs/icons/icon-tree.svg';
import IconWalk from '@/assets/imgs/icons/icon-walk.svg';
import BombAni from '@/assets/imgs/bomb-ani.png';
import { history } from 'umi';
import { getTokenBalance } from '@/services/chain/token';
import WateringImg from '@/assets/imgs/water-box.png';
import { watering as wateringApi, attack } from '@/services/chain/token';
import { burnToken } from '@/services/api';
import {
  getUnhealthyAmount,
  getGrowthAmount,
  getNftMetaData,
} from '@/services/chain/nft';
import freeTree2 from '@/assets/imgs/trees/free-tree-2.png';
import freeTree1 from '@/assets/imgs/trees/free-tree-1.png';
import freeTree0 from '@/assets/imgs/trees/free-tree-0.png';
import freeTreeDie from '@/assets/imgs/trees/free-tree-die.png';
import buyTree2 from '@/assets/imgs/trees/buy-tree-2.png';
import buyTree1 from '@/assets/imgs/trees/buy-tree-1.png';
import buyTree0 from '@/assets/imgs/trees/buy-tree-0.png';
import buyTreeDie from '@/assets/imgs/trees/buy-tree-die.png';
import { FreeNftTokenMax, getBodyLevel, BodyStatus } from '@/constants/global';
import { useModel } from 'umi';

import { switchChainCheck } from '@/utils/util';
import chainInfo from '@/constants/chainInfo';
const treeMap = {
  free: {
    '0': freeTree0,
    '1': freeTree1,
    '2': freeTree2,
    die: freeTreeDie,
  },
  buy: {
    '0': buyTree0,
    '1': buyTree1,
    '2': buyTree2,
    die: buyTreeDie,
  },
};
interface Props {
  nftTokenIdList: Array<number>;
  account: string;
}

const Index = ({ nftTokenIdList, account }: Props) => {
  const ref = useRef<SwiperRef>(null);
  const [tokenNum, setTokenNum] = useState(-1);
  const [showWatering, setShowWatering] = useState(false);
  const [showEarnButton, setShowEarnButton] = useState(false);
  const [growthAmount, setGrowthAmount] = useState(0);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [currentUnhealthyAmount, setCurrentUnhealthyAmount] = useState(0);
  const [unhealthyAmount, setUnhealthyAmount] = useState(0);
  const [currentTokenId, setCurrentTokenId] = useState(nftTokenIdList[0]);
  const [treeImgMap, setTreeImgMap] = useState<any>(null);
  const [isWatering, setIsWatering] = useState(false);
  const [bombIsFade, setBombIsFade] = useState(false);
  const [isShowBombAin, setIsShowBombAin] = useState(false);
  const [currentTreeImg, setCurrentTreeImg] = useState('');
  const [bubbleCounts, setBubbleCounts] = useState([]);
  const { initialState, loading, error, refresh, setInitialState } = useModel(
    '@@initialState',
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { latestEmission } = initialState;
  const [showWarning, setShowWarning] = useState(false);
  const [waringText, setWaringText] = useState('');

  const width =
    currentUnhealthyAmount === 0
      ? '100%'
      : `${(100 * currentUnhealthyAmount) / unhealthyAmount}%`;
  const watering = () => {
    if (tokenNum === 0) {
      Toast.show({ icon: 'fail', content: <div>无碳能量(CET)!</div> });
      return;
    }
    const num = tokenNum >= 200 ? 200 : tokenNum;
    setIsWatering(true);
    wateringApi(currentTokenId, num, account)
      .then((data) => {
        console.log(data);
        Toast.show({
          content: <div>消耗 {num} CET</div>,
        });
        setShowWatering(true);
        setTimeout(() => {
          setShowWatering(false);
          setTokenNum(tokenNum - num);
          setGrowthAmount(growthAmount + num);
          setCurrentUnhealthyAmount(currentUnhealthyAmount - num);

          //if (currentUnhealthyAmount>0 && currentUnhealthyAmount - num < 0) location.reload();
        }, 2900);
      })
      .finally(() => {
        setIsWatering(false);
      });
  };
  const attackOthers = (num: number) => {
    attack(account, currentTokenId, num).then(async (tx: any) => {
      await tx.wait();
      setTimeout(() => {
        getTreeInfo();
        //animation？
      }, 3000);
    });
  };
  const getTreeImg = () => {
    if (growthLoading) return null;
    if (!treeImgMap) return null;
    const isFree = currentTokenId > FreeNftTokenMax;
    const isDie = currentUnhealthyAmount > 0;
    const level = getBodyLevel(growthAmount);
    if (isDie) {
      return treeImgMap['die'];
    } else {
      return treeImgMap[level];
    }
  };
  const getTreeInfo = async () => {
    setGrowthLoading(true);
    setTreeImgMap(null);
    Promise.all([
      getGrowthAmount(currentTokenId),
      getUnhealthyAmount(currentTokenId),
    ]).then((values) => {
      const [growth, health] = values;
      setGrowthAmount(growth.toNumber());
      setUnhealthyAmount(health.toNumber());
      setCurrentUnhealthyAmount(health.toNumber());
      setGrowthLoading(false);
      getNftMetaData(currentTokenId).then((metaDataUrl: string) => {
        console.log(metaDataUrl);
        fetch(metaDataUrl)
          .then((r) => r.json())
          .then((info) => {
            const {
              largeStatusImage,
              mediumStatusImage,
              smallStatusImage,
              witheredStatusImage,
              rarity,
            } = info;
            const map = {
              [BodyStatus.Large]: largeStatusImage,
              [BodyStatus.Middle]: mediumStatusImage,
              [BodyStatus.Small]: smallStatusImage,
              die: witheredStatusImage,
            };
            setTreeImgMap(map);
          });
      });
    });
  };
  const setBubbleInfo = (payload: any) => {
    const bbc = bubbleCounts.map((value) => {
      if (value.id === payload) {
        value.isFade = true;
        if (value.type === 1) {
          const treeBubble = localStorage.getItem(EnergyTreeKey + account);

          localStorage.setItem(
            EnergyTreeKey + account,
            String(Number(treeBubble) - value.count),
          );
        }
        if (value.type === 2) {
          const walkBubble = localStorage.getItem(EnergyWalkKey + account);
          localStorage.setItem(
            EnergyWalkKey + account,
            String(Number(walkBubble) - value.count),
          );
        }
      }
      return value;
    });
    setBubbleCounts(bbc);
  };
  const goWalk = () => {
    history.push('/walk');
  };
  const goDonate = () => {
    history.push('/donate');
  };

  const getToken = () => {
    getTokenBalance(account).then((v) => {
      console.log(v);
      const num = v.toNumber();
      setTokenNum(num);
    });
  };

  useEffect(() => {
    if (account) getToken();
  }, [account]);

  useEffect(() => {
    getTreeInfo();
  }, [currentTokenId]);

  useEffect(() => {
    const isOk = localStorage.getItem('BOMB_IS_OK');
    if (isOk) return;
    if (!treeImgMap) return;
    if (latestEmission) {
      setTimeout(() => {
        setWaringText(`你昨天排放 ${latestEmission}g 碳，已生成毒气弹。`);
        setShowWarning(true);
        setTimeout(() => {
          setWaringText(
            `
          你的好友Rockey 正在点燃你的毒气弹，树木即将枯萎。
          `,
          );
          setBombIsFade(true);
          setIsShowBombAin(true);
          setGrowthLoading(true);
          setTimeout(() => {
            setIsShowBombAin(false);
            setCurrentUnhealthyAmount(latestEmission);
            setUnhealthyAmount(latestEmission);
            setGrowthLoading(false);
            setShowWarning(false);
            localStorage.setItem('BOMB_IS_OK', 'true');
          }, 2200);
        }, 5000);
      }, 1500);
    }
  }, [latestEmission, treeImgMap]);

  useEffect(() => {
    const treeBubble = localStorage.getItem(EnergyTreeKey + account);
    const walkBubble = localStorage.getItem(EnergyWalkKey + account);
    const arr = [];
    if (Number(treeBubble)) {
      arr.push({
        count: Number(treeBubble),
        type: 1,
      });
    }

    if (Number(walkBubble)) {
      let num = Number(walkBubble);
      const size = 7 - arr.length;
      for (let index = 1; index < size; index++) {
        // Number(walkBubble)
        if (num > 200 && index < size - 1) {
          arr.push({
            count: 200,
            type: 2,
          });
          num -= 200;
        } else {
          arr.push({
            count: num,
            type: 2,
          });
          break;
        }
      }
    }

    const bubbleCounts = arr.map((item, index) => {
      return {
        ...item,
        id: index + 1,
        position: index + 1,
        isFade: false,
      };
    });
    setBubbleCounts(bubbleCounts);
  }, []);

  return (
    <div className={styles.index}>
      {showWarning && <div className={styles.toast}>{waringText}</div>}
      {isShowBombAin && (
        <div className={styles.bombAni}>
          <img src={BombAni} alt="" />
        </div>
      )}
      <div className={styles.tree}>
        <Swiper
          allowTouchMove={true}
          onIndexChange={(index) => {
            setCurrentTokenId(nftTokenIdList[index]);
          }}
          ref={ref}
          loop
          className={styles.treeList}
        >
          {nftTokenIdList.map((v) => {
            return (
              <Swiper.Item key={v} className={styles.treeItem}>
                <div className={styles.treeItem}>
                  {getTreeImg() ? (
                    <img src={getTreeImg()} />
                  ) : (
                    <div className={styles.loading}>
                      <DotLoading color="#3ab795" />
                    </div>
                  )}
                </div>
              </Swiper.Item>
            );
          })}
        </Swiper>
        <div
          className={styles.my}
          onClick={() => {
            history.push('myAccount');
          }}
        >
          <div className={styles.info}>
            <div>{addressShow(account, 4)}</div>
            <div>
              {/* My carbon account */}
              我的碳账户
            </div>
          </div>
          <img src={IconMy} />
        </div>
        <div className={styles.bubbles}>
          {bubbleCounts &&
            bubbleCounts.map((v, i) => (
              <div
                key={i}
                onClick={() => {
                  setBubbleInfo(v.id);
                }}
                className={`${styles.bubblesBlock} ${
                  styles[`position_${v.position}`]
                } ${v.isFade ? styles.fadeOutUp : styles.bounce} ${
                  v.isFade ? '' : styles[`position_delay_${v.position}`]
                }`}
              >
                <div className={styles.bubblesBlockTop}>{v.count}</div>
                <div className={styles.bubblesBlockBottom}>
                  <div className={styles.bubblesDesc}>
                    <span
                      className={`${
                        v.type === 1
                          ? styles.bubbleIconTree
                          : styles.bubbleIconWalk
                      }`}
                    ></span>
                    <span className={styles.bubbleIconText}>
                      {v.type === 2 ? '步行' : '捐树'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          {showWarning && (
            <div
              onClick={() => {
                // setBombIsFade(true);
                // setIsShowBombAin(true);
                // setTimeout(() => {
                //   setIsShowBombAin(false);
                // }, 2200);
              }}
              className={`${styles.bubblesBlock} ${styles.bubblesBomb} ${
                styles[`position_7`]
              } ${bombIsFade ? styles.fadeOutUp : styles.bounce} ${
                bombIsFade ? '' : styles[`position_delay_7`]
              }`}
            >
              <div className={styles.bubblesBlockTop}>{latestEmission}g</div>
              <div className={styles.bubblesBlockBottom}>
                <div className={styles.bubblesDesc}>
                  <span className={styles.bubbleIconText}>碳排放</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.options}>
          <div
            className={classnames(styles.option, styles.earn)}
            onClick={() => {
              setShowEarnButton(!showEarnButton);
            }}
          >
            <div>赚能量 </div>
            <div>{'(CET)'}</div>
            {showEarnButton && (
              <div className={styles.earnOptions}>
                <div
                  className={classnames(styles.item, styles.walk)}
                  onClick={(e) => {
                    e.stopPropagation();
                    goWalk();
                  }}
                >
                  <img src={IconWalk} />
                  <div>步行</div>
                </div>
                <div
                  className={classnames(styles.item, styles.donate)}
                  onClick={(e) => {
                    e.stopPropagation();
                    goDonate();
                  }}
                >
                  <img src={IconTree} />
                  <div>捐树</div>
                  <div className={styles.subTitle}>+78500</div>
                </div>
              </div>
            )}
          </div>
          <div
            className={classnames(styles.option, styles.water)}
            onClick={() => {
              if (isWatering) return;
              switchChainCheck(chainInfo.chainId, watering);
            }}
          >
            {isWatering ? (
              <DotLoading />
            ) : (
              <>
                <div>Watering</div>
                <div>{tokenNum < 0 ? <DotLoading /> : `${tokenNum}CET`}</div>
              </>
            )}
          </div>
        </div>
        <div className={styles.treeInfo}>
          <span className={styles.level}>
            LV{' '}
            {growthLoading ? (
              <DotLoading color="#3ab795" />
            ) : (
              getLevel(growthAmount)
            )}
          </span>
          <span>#{currentTokenId}</span>
        </div>
        {currentUnhealthyAmount > 0 && (
          <div className={styles.unhealthy}>
            <div> 请先补充水分{unhealthyAmount}g恢复正常状态 </div>
            {/* <div className={styles.water}>water</div>
            <div className={styles.bar}>
              <div className={styles.barInner} style={{ width }}>
                <div className={styles.left}>{currentUnhealthyAmount}g</div>
                <div className={styles.right}>0</div>
              </div>
            </div> */}
          </div>
        )}

        {showWatering && <img src={WateringImg} className={styles.watering} />}
      </div>
      <div className={styles.infoList}>
        <div className={styles.title}>
          <div className={styles.left}>历史</div>
          <CopyToClipboard
            text={window.location.href + '?address=' + account}
            onCopy={() => {
              Toast.show({
                content: <div>邀请链接已复制</div>,
              });
            }}
          >
            <div className={styles.right}>邀请好友帮我浇水</div>
          </CopyToClipboard>
        </div>
        <div className={styles.list}>
          {list.map((v, index) => {
            return (
              <div className={styles.item} key={v.id}>
                <img src={v.img} className={styles.headerIcon}></img>
                <div className={styles.info}>
                  <div className={styles.top}>
                    {v.name},
                    {v.type === 0
                      ? `给你浇水, ${v.num}CET`
                      : v.type === 1
                      ? `收取你的能量, ${v.num}CET`
                      : '点燃了你的毒气弹'}
                  </div>
                  <div className={styles.bottom}>
                    {dayjs(v.timestamp).format('YYYY.MM.DD HH:mm')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
