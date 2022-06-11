export default [
  { exact: true, path: '/', component: 'index' },
  {
    exact: true,
    path: '/donate',
    component: 'donate',
    title: 'Choose origin of the tree',
  },
  { exact: true, path: '/walk', component: 'walk' },
  {
    exact: true,
    path: '/myAccount',
    component: 'myAccount',
    title: 'My Carbon Account',
  },
];
