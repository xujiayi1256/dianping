// pages/show/show.js
Page({
  data: {
    restaurantID: null,
    restaurant: {},
    reviews: [],
    ratingValues: [1, 2, 3, 4, 5],
    rating: 5,
    content: '',
    state: 'meals'
  },

  onChangeContent: function (event) {
    this.setData({
      content: event.detail.value
    })
  },

  changeState: function () {
    if (this.data.state == 'reviews') {
      this.setData({
        state: 'meals'
      })
    } else {
      this.setData({
        state: 'reviews'
      })
    }
  },

  onLoad: function (options) {
    this.setData({
      restaurantID: options.id
    })

    // 获取餐厅详情
    let Restaurant = new wx.BaaS.TableObject('restaurants')
    Restaurant.get(options.id).then(res => {
      this.setData({
        restaurant: res.data
      })
    })
    this.fetchReviews()
    this.fetchMeals()

    wx.BaaS.auth.getCurrentUser().then(user => {
      // console.log(user) // user 为 currentUser 对象
      this.setData({
        currentUser: user
      })
    }).catch(err => {
      if (err.code === 604) {
        console.log('用户未登录')
        // wx.switchTab({
        //   url: '/pages/login/login',
        // })
        // wx.showModal({
        //   title: '用户未登录',
        //   content: err.message,
        // })
      }
    })

  },

  showUserPage: function (event) {
    wx.switchTab({
      url: '/pages/login/login',
    })
  },

  fetchReviews: function () {
    // 获取餐厅评论
    let Review = new wx.BaaS.TableObject('reviews')
    let query = new wx.BaaS.Query
    query.compare('restaurant_id', '=', this.data.restaurantID)
    Review.setQuery(query).expand(['user_id']).find().then(res => {
      let reviews = res.data.objects
      let count = res.data.meta.total_count //Count is given by the request
      this.setData({
        reviews: reviews
      })
      // console.log(this.data.reviews)
      let rating_sum = reviews.reduce((sum, review) => sum + review.rating, 0)

      this.setData({
        rating: rating_sum / count
      })
    })
  },

  fetchMeals: function () {
    // 获取餐厅菜品
    let Meal = new wx.BaaS.TableObject('meal')
    let query = new wx.BaaS.Query
    query.compare('restaurant_id', '=', this.data.restaurantID)
    Meal.setQuery(query).find().then(res => {
      this.setData({
        meals: res.data.objects
      })
      // console.log(res.data.objects)
    })
  },

  deleteReview(event) {
    const data = event.currentTarget.dataset;

    // 删除 tableName 为 'comments' 的数据表中 recordID 的数据项
    let tableName = 'reviews'
    let recordID = data.id

    let Review = new wx.BaaS.TableObject(tableName)
    Review.delete(recordID).then(
      // wx.redirectTo({
      //   url: '/pages/index/index'
      // })
      this.fetchReviews()
    )
  },

  rateReview: function(event) {
    const page = this
    const data = event.currentTarget.dataset;

    const id = data.id
    const rating = data.rating;

    let Review = new wx.BaaS.TableObject('reviews')
    let review = Review.getWithoutData(id)

    review.set('rating', rating)
    review.update().then(res => {

      const new_review = res.data   // new review from BaaS response
      let reviews = page.data.reviews // reviews on the page

      // find the review in the page reviews matching the Baas response
      let review = reviews.find(review => review._id == new_review.id)

      // updating that matched review
      review.rating = new_review.rating

      // putting all the reviews back on the page
      page.setData({ reviews: reviews })
      let rating_sum = reviews.reduce((sum, review) => sum + review.rating, 0)

      page.setData({
        rating: rating_sum / reviews.length
      })
    })
    
  },

  onChangeRating: function (event) {
    let index = event.detail.value
    let rating = this.data.ratingValues[index]
    this.setData({
      rating: rating
    })
  },

  onSubmitOrder: function (event) {
    let currentUser = this.data.currentUser
    let mealId = event.currentTarget.dataset.id
    let points = event.currentTarget.dataset.points
    // console.log(points)
    let Order = new wx.BaaS.TableObject('orders')
    let order = Order.create()
    order.set({
      user_id: currentUser.id.toString(),
      meal: mealId,
      quantity: 1
    })
    order.save().then(function (res) {
      let currentPoints = currentUser.get('points')
      // console.log(currentPoints)
      let newPoints = currentPoints + points
      // currentUser.incrementBy('points', points)
      if (newPoints < 0) {
        wx.showModal({
          title: ' 积分不足',
          content: '请确认积分充足后再下单'
        })
      } else {
        currentUser.set('points', newPoints)
        currentUser.update().then(function () {
          wx.showModal({
            title: ' 订单创建成功',
            content: '请前往个人中心查看',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/orders/orders',
                })
              } else if (res.cancel) {
                // 
              }
            }
          })
        })
      }
    }).catch(function (err) {
      wx.showModal({
        title: '订单创建失败',
        content: err.message
      })
    })
  },

  createReview: function (event) {
    let content = this.data.content
    let rating = this.data.rating
    let Review = new wx.BaaS.TableObject('reviews')
    let review = Review.create()
    review.set({
      user_id: this.data.currentUser.id.toString(),
      restaurant_id: this.data.restaurantID,
      content: content,
      rating: rating
    })

    review.save().then(res => {
      this.fetchReviews()
      this.setData({
        content: '',
        rating: 5
      })
    })
  }
})