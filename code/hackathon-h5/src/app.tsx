import '@/assets/styles/global.less';
import wallet from '@/utils/wallet';
import { loginApi } from '@/services/api';
export async function getInitialState() {
  const defaultInfo = {
    account: '',
    chainId: '',
    latestEmission: 0,
    totalEmission: 0,
    latestBurnToken: 0,
  };

  try {
    window.ethereum.on('accountsChanged', () => {
      location.reload();
    });
    let obj = {};
    const info = await wallet.connect(true);

    if (!info) return defaultInfo;
    obj = Object.assign(obj, info);
    const { data } = await loginApi({
      address: info.account,
    });
    if (data) obj = Object.assign(obj, data);
    return obj;
  } catch (e) {
    return defaultInfo;
  }
}
