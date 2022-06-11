import styles from './index.less';
import IconTime from '@/assets/imgs/icons/icon-time.svg';
import IconKm from '@/assets/imgs/icons/icon-km.svg';
import IconSpeed from '@/assets/imgs/icons/icon-speed.svg';
import IconStart from '@/assets/imgs/icons/icon-start.svg';
import IconStop from '@/assets/imgs/icons/icon-stop.svg';
import { useState, useRef, useEffect } from 'react';
import IconBack from '@/assets/imgs/icons/icon-back.svg';
import Decimal from 'decimal.js';
import { updateApi } from '@/services/api';
import { useModel, history } from 'umi';
import { EnergyWalkKey } from '@/constants/global';
const Index = () => {
  const { initialState } = useModel('@@initialState');

  const [isStart, setIsStart] = useState(false);
  const [timer, setTimer] = useState();
  const [valueMap, setValueMap] = useState({
    timeValue: '00:00',
    speedValue: 5.9,
    kmValue: 0,
  });

  const { account } = initialState;
  const second = useRef(0);

  const list = [
    { icon: IconTime, value: valueMap.timeValue, unit: 'Seconds' },
    { icon: IconKm, value: valueMap.kmValue, unit: 'Kilometers' },
    { icon: IconSpeed, value: valueMap.speedValue, unit: 'km/h' },
  ];
  const report = () => {
    if (valueMap.kmValue <= 0) return;
    updateApi({
      address: account,
      type: 1,
      value: valueMap.kmValue,
    });

    const num = localStorage.getItem(EnergyWalkKey + account);
    if (num) {
      localStorage.setItem(
        EnergyWalkKey + account,
        String(new Decimal(valueMap.kmValue).mul(200).add(num).toFixed()),
      );
    } else {
      localStorage.setItem(
        EnergyWalkKey + account,
        String(new Decimal(valueMap.kmValue).mul(200).toFixed()),
      );
    }
  };
  const start = () => {
    const timer = setInterval(() => {
      second.current = second.current + 1;
      const minutes = Math.floor(Number(second.current) / 60);

      const seconds =
        minutes > 0 ? second.current - minutes * 60 : second.current;
      const timeValue = `${minutes >= 10 ? minutes : '0' + minutes}:${
        seconds >= 10 ? seconds : '0' + seconds
      }`;
      const kmValue = new Decimal(valueMap.speedValue)
        .div(60)
        .mul(second.current)
        .toFixed(2);

      setValueMap({
        timeValue,
        kmValue,
        speedValue: 5.9,
      });
    }, 1000);
    setTimer(timer);
  };
  const stop = () => {
    clearInterval(timer);
    report();
    history.goBack();
  };

  return (
    <div className={styles.walk}>
      <div className={styles.banner}>
        <div className={styles.info}>
          <div>碳能量 {'(CET)'}</div>
          <div className={styles.num}>
            + {new Decimal(valueMap.kmValue).mul(200).toFixed()}
          </div>
        </div>
        <img
          src={IconBack}
          className="back"
          onClick={async () => {
            report();
            history.goBack();
          }}
        />
      </div>
      <div className={styles.number}>
        <div className={styles.list}>
          {list.map((v, i) => {
            return (
              <div className={styles.item} key={i}>
                <img src={v.icon} />
                <div>{v.value}</div>
                {v.unit && <div className={styles.unit}>{v.unit}</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.option}>
        <img
          src={isStart ? IconStop : IconStart}
          onClick={() => {
            setIsStart(!isStart);
            if (isStart) stop();
            else start();
          }}
        />
      </div>
    </div>
  );
};
export default Index;
