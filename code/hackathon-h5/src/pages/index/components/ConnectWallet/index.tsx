import { Button } from 'antd-mobile';
import styles from './index.less';
interface Props {
  connect: () => void;
}
const Index = ({ connect }: Props) => {
  return (
    <div className={styles.connectWallet}>
      <Button
        color="#fff"
        className="mf-round-button"
        fill="outline"
        onClick={() => {
          connect();
        }}
      >
        CONNECT WALLET
      </Button>
    </div>
  );
};
export default Index;
