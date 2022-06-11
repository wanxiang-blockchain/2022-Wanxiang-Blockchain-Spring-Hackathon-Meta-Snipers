import { useEffect, useState } from 'react';
import styles from './index.less';
import { queryCarbonCredits } from '@/services/api';
import dayjs from 'dayjs';
import { useModel } from 'umi';

const MyAccount = () => {
  const [weeksList, setWeeksList] = useState([
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  const [dateList, setDateList] = useState([]);
  const [originDataList, setOriginList] = useState([]);
  const [currentDate, setCurrentDate] = useState(+new Date());

  const [dayInMonth] = useState(dayjs().date() - 1);
  const formateAddress = (payload: string) => {
    return (
      payload.substring(0, 6) + '...' + payload.substring(payload.length - 4)
    );
  };
  const { initialState, loading, error, refresh, setInitialState } = useModel(
    '@@initialState',
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const {
    account,
    latestEmission,
    totalEmission,
    latestBurnToken,
  } = initialState;
  const getCalendarList = async () => {
    const { data } = await queryCarbonCredits(account);
    if (Array.isArray(data) && data.length > 0) {
      setOriginList(data);
      const firstWeekNum = dayjs(data[0].timestamp).day();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setDateList([...Array(firstWeekNum).fill([]), ...data]);
    }
  };
  useEffect(() => {
    getCalendarList();
  }, []);
  return (
    <div className={styles.accountMain}>
      <div className={styles.accountTop}>
        <div className={styles.userAddress}>{formateAddress(account)}</div>
        <div className={styles.accountDate}>昨日</div>
        <div className={styles.accountStatus}>
          {originDataList &&
          Array.isArray(originDataList) &&
          originDataList.length > 0
            ? originDataList[dayInMonth - 1]['isOffset']
              ? '已中和'
              : '未中和'
            : '-'}
        </div>
        <div className={styles.accountInfo}>
          <div className={styles.accountInfoBlock}>
            <p className={styles.accountInfoHeader}>昨日销毁碳能量</p>
            <p className={styles.accountInfoNum}>
              {latestBurnToken ? latestBurnToken.toLocaleString() : 0}
            </p>
          </div>
          <div className={styles.accountInfoBlock}>
            <p className={styles.accountInfoHeader}>昨日碳排放</p>
            <p className={styles.accountInfoNum}>
              {latestEmission ? latestEmission.toLocaleString() : 0}g
            </p>
          </div>
          <div className={styles.accountInfoBlock}>
            <p className={styles.accountInfoHeader}>累计碳排放</p>
            <p className={styles.accountInfoNum}>
              {totalEmission ? totalEmission.toLocaleString() : 0}g
            </p>
          </div>
        </div>
        {/* <div className={styles.userInfo}>
          <div className={styles.userHeader}>
            <img src={''} alt="" />
          </div>
          <div className={styles.userAddress}>{formateAddress(account)}</div>
        </div> */}
      </div>
      <div className={styles.carbonCalendar}>
        <div className={styles.carbonCalendarHeader}>
          <span>{dayjs(currentDate).format('MMMM')}</span>
        </div>
        <div className={styles.carbonCalendarBody}>
          <div className={styles.carbonCalendarBodyTop}>
            {weeksList.map((v, i) => (
              <div key={i} className={styles.weekName}>
                {v}
              </div>
            ))}
          </div>

          <div className={styles.carbonCalendarBodyContent}>
            {dateList &&
              dateList.length > 0 &&
              dateList.map((v: any, i) => (
                <div
                  key={i}
                  className={`${styles.calendarBlock} ${
                    typeof v.timestamp !== 'undefined'
                      ? dayjs().isBefore(v.timestamp, 'day')
                        ? ''
                        : v.isOffset
                        ? styles.calendarBlockGreen
                        : styles.calendarBlockRed
                      : ''
                  }`}
                >
                  <div className={styles.calendarBlockTop}>
                    {typeof v.timestamp !== 'undefined'
                      ? dayjs(v.timestamp).format('DD')
                      : ''}
                  </div>
                  <div className={styles.calendarBlockBottom}>
                    {typeof v.timestamp !== 'undefined' ? v.increase + 'g' : ''}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {originDataList && originDataList.length > 0 && (
        <div className={styles.footPrint}>
          <h2>我的WEB3碳足迹</h2>
          <p>
            昨天在Nervos上产生了 {originDataList[dayInMonth]['txAmount']}{' '}
            笔交易，共产生 {originDataList[dayInMonth]['increase']}g 的碳排放。
          </p>
          <p>
            昨天销毁 {originDataList[dayInMonth]['burnToken']}{' '}
            个碳能量token，减排 {originDataList[dayInMonth]['burnToken']}g CO2。
          </p>
          <p>
            两天前在Nervos上产生了 {originDataList[dayInMonth - 1]['txAmount']}{' '}
            笔交易，共产生 {originDataList[dayInMonth - 1]['increase']}g
            的碳排放。
          </p>
          <p>
            两天前销毁 {originDataList[dayInMonth - 1]['burnToken']}{' '}
            个碳能量token，减排{' '}
            {originDataList[dayInMonth - 1]['burnToken'] * 10}g CO2。
          </p>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
