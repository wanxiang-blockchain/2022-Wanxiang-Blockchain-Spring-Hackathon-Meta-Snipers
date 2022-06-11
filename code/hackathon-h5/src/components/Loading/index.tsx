import { DotLoading } from 'antd-mobile';
import styles from './index.less';
const Index = ({ color = '#fff' }) => {
  return (
    <div className={styles.loading} style={{ color }}>
      <DotLoading color={color}></DotLoading>Loading
    </div>
  );
};
export default Index;
