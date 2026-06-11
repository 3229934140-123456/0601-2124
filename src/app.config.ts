export default defineAppConfig({
  pages: [
    'pages/publish/index',
    'pages/match/index',
    'pages/communication/index',
    'pages/review/index',
    'pages/mine/index',
    'pages/demand-detail/index',
    'pages/supplier-detail/index',
    'pages/comparison-detail/index',
    'pages/satisfaction/index',
    'pages/deal-review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '数据需求撮合平台',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165DFF',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/publish/index',
        text: '需求发布'
      },
      {
        pagePath: 'pages/match/index',
        text: '供应匹配'
      },
      {
        pagePath: 'pages/communication/index',
        text: '沟通记录'
      },
      {
        pagePath: 'pages/review/index',
        text: '评审清单'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的事项'
      }
    ]
  }
})
