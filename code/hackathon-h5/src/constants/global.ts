import Mock from 'mockjs';
import Header1 from '@/assets/imgs/header1.png';
import Header2 from '@/assets/imgs/header2.png';
import Header3 from '@/assets/imgs/header3.jpg';
export const FreeNftTokenMax = 8000;
export const list = [
  {
    id: Mock.Random.uuid(),
    name: Mock.Random.first(),
    num: Mock.Random.integer(5, 20),
    type: Mock.Random.pick([0, 1, 2]),
    timestamp: Date.now(),
    img: Header1,
  },
  {
    id: Mock.Random.uuid(),
    name: Mock.Random.first(),
    num: Mock.Random.integer(5, 20),
    type: Mock.Random.pick([0, 1, 2]),
    timestamp: Date.now() - Mock.Random.integer(1, 2) * 180000,
    img: Header2,
  },
  {
    id: Mock.Random.uuid(),
    name: Mock.Random.first(),
    num: Mock.Random.integer(5, 20),
    type: Mock.Random.pick([0, 1, 2]),
    timestamp: Date.now() - Mock.Random.integer(4, 5) * 180000,
    img: Header3,
  },
];

export enum BodyStatus {
  Small = 0,
  Middle = 1,
  Large = 2,
}

const LevelList = [
  20,
  40,
  60,
  110,
  160,
  210,
  260,
  360,
  460,
  560,
  660,
  880,
  1080,
  1280,
  1480,
  1780,
  2080,
  2380,
  2680,
  2980,
  3480,
  3980,
  4480,
  4980,
  5480,
  5980,
  6780,
  7580,
  8380,
  9180,
];

export const getLevel = (num: number) => {
  for (let i = 0; i < LevelList.length; i++) {
    if (num < LevelList[i]) return i;
  }
  return 0;
};

export const getBodyLevel = (num: number) => {
  if (num <= 210) return BodyStatus.Small;
  else if (num <= 1310) return BodyStatus.Middle;
  return BodyStatus.Large;
};

export const EnergyTreeKey = 'Energy_Tree';
export const EnergyWalkKey = 'Energy_Walk';
