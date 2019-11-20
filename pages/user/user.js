// pages/user/user.js
Page({
  data: {
    currentUser: null
  },

  onSubmit: function (event) {
    // console.log(event)
    let username = event.detail.value.username
    let password = event.detail.value.password
    let page = this
    wx.BaaS.auth.register({
      username: username,
      password: password
    }).then(function (user) {
      // console.log(user)
      page.setData({
        currentUser: user
      })
    }).catch(err => {
      console.log(err)
      if (err.code === 400) {
        // console.log('用户未登录')

        wx.showModal({
          title: '用户已存在，请登录',
          content: err.message,
        })

        setTimeout(function () {
          wx.navigateBack({
            // url: '/pages/login/login'
          })
        }, 3000)
      }
    })
  },
  onLoad: function (options) {
    wx.BaaS.auth.getCurrentUser().then(user => {
      console.log(user) // user 为 currentUser 对象
      this.setData({
        currentUser: user
      })
    }).catch(err => {
      if (err.code === 604) {
        console.log('用户未登录')
        // wx.showModal({
        //   title: '用户未登录',
        //   content: err.message,
        // })
      }
    })
  }
})
