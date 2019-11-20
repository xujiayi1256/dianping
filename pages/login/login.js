// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentUser: null,
    state: 'login'
  },

  changeState: function () {
    // wx.navigateTo({
    //   url: '/pages/user/user'
    // })
    if (this.data.state == 'register') {
      this.setData({
        state: 'login'
      })
    } else {
      this.setData({
        state: 'register'
      })
    }
  },

  bindLogout: function () {
    wx.BaaS.auth.logout()
    // .then(() => {
    //   wx.reLaunch({
    //     url: '/pages/login/login',
    //   })
    //   // console.log(this.currentUser)
    // })
    this.setData({
      currentUser: null
    })
  },

  bindLogin: function (event) {
    // console.log(event)
    let username = event.detail.value.username
    let password = event.detail.value.password
    let page = this
    wx.BaaS.auth.login({
      username: username,
      password: password
    }).then(user => {
      // console.log(user)
      page.setData({
        currentUser: user
      })
    }).catch(err => {
      // console.log(err)
      if (err.code === 400) {
        // console.log('用户未登录')
        wx.showModal({
          title: '账号/密码错误！',
          content: err.message,
        })
      }
    })
  },

  userInfoHandler: function (data) {
    wx.BaaS.auth.loginWithWechat(data).then(user => {
      console.log(user)
      this.setData({
        currentUser: user
      })
    }).catch(err => {
      // console.log(err)
      if (err.code === 400) {
        // console.log('用户未登录')
        wx.showModal({
          title: '登录失败',
          content: err.message,
        })
      }
    })
  },

  onRegister: function (event) {
    // console.log(event)
    let username = event.detail.value.username
    let password = event.detail.value.password
    let page = this
    if (!username || !password) {
      wx.showModal({
        title: '用户名/密码不能为空',
        content: '用户名/密码不能为空',
      })
    } else {
      wx.BaaS.auth.register({
        username: username,
        password: password
      }).then(user => {
        // console.log(user)
        page.setData({
          currentUser: user
        })
      }).catch(err => {
        // console.log(err)
        if (err.code === 400) {
          // console.log('用户未登录')
          wx.showModal({
            title: '用户已存在，请登录',
            content: err.message,
          })

          setTimeout(function () {
            // wx.navigateBack({
            //   // url: '/pages/login/login'
            // })
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }, 3000)
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const page = this
    wx.BaaS.auth.getCurrentUser().then(user => {
      // console.log(user) // user 为 currentUser 对象
      page.setData({
        currentUser: user
      })
    }, error => {
      console.log(error)
      page.setData({ currentUser: null })
    })
    // .catch(err => {
    //   if (err.code === 604) {
    //     console.log('用户未登录')
        // wx.showModal({
        //   title: '用户未登录',
        //   content: err.message,
        // })
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})