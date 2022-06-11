import styles from './index.less';
import { addressShow } from '@/utils/util';
import { Button, DotLoading } from 'antd-mobile';
import { useEffect, useState } from 'react';

interface Props {
  account: string;
  latestEmission: number;
  getFreeNftTree: () => void;
  loading: boolean;
}
const Index = ({ account, latestEmission, getFreeNftTree, loading }: Props) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 3000);
  }, []);
  return (
    <div className={styles.index}>
      <div className={styles.address}>{addressShow(account)}</div>
      <div className={styles.computing}>
        {/* Your Web3 Carbon Emission under calculating... */}
        正在计算您的web3碳足迹…
      </div>
      {visible && (
        <>
          <div className={styles.createText}>您上一日在web3世界产生的碳量</div>
          <div className={styles.createNumber}>{`${latestEmission}g`}</div>
          <div className={styles.start}>
            <div>开启Meta Tree 加入低碳生活来抵消您的碳足迹</div>
          </div>
          <Button
            className="mf-round-button"
            fill="outline"
            disabled={loading}
            loading={loading}
            style={{ color: '#fff' }}
            onClick={() => {
              getFreeNftTree();
            }}
          >
            点击领取我的NFT树
          </Button>
        </>
      )}
    </div>
  );
};

export default Index;
