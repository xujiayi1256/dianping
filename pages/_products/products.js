// pages/products/products.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carts: [],
    totalPrice: 0,
    products: [],
    currentUser: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchProducts()
    // this.fetchCarts()
    wx.BaaS.auth.getCurrentUser().then(user => {
      // console.log(user) // user 为 currentUser 对象
      this.setData({
        currentUser: user
      })
    })
  },

  fetchProducts: function () {
    const page = this
    let Product = new wx.BaaS.TableObject('products')
    Product.find().then(function (res) {
      page.setData({
        products: res.data.objects
      })
      page.fetchCarts()
    })
  },

  fetchCarts: function () {
    const page = this
    let Cart = new wx.BaaS.TableObject('carts')
    Cart.find().then(function (res) {
      page.setData({
        carts: res.data.objects
      })
      // 把carts数据合并到products中
      let carts = page.data.carts
      page.data.products.forEach(function (product) {
        let cart = carts.find((cart) => cart.product.id == product.id)
        if (cart) {
          product.quantity = cart.quantity
          product.cart_id = cart.id
        } else {
          // 不在购物车里，什么都不做
        }
      })
      page.setData({
        products: page.data.products
      })
      page.updateTotalPrice()
    })
  },

  onAdd: function (event) {
    let productId = event.currentTarget.dataset.id
    let product = this.data.products.find((product) => product.id == productId)
    if (product.quantity) {
      product.quantity += 1
    } else {
      product.quantity = 1
    }
    this.setData({
      products: this.data.products
    })
    this.addToCart(product, product.quantity)
    this.updateTotalPrice()
  },

  onMinus: function (event) {
    let productId = event.currentTarget.dataset.id
    let product = this.data.products.find((product) => product.id == productId)
    if (product.quantity) {
      product.quantity -= 1

    } else {
      product.quantity = 0
    }
    this.setData({
      products: this.data.products
    })
    this.addToCart(product, product.quantity)
    this.updateTotalPrice()
  },

  updateTotalPrice: function () {
    // let totalPrice = this.data.products.reduce((sum,product)=>{
    //   let price = product.price * (product.quantity || 0)
    //   return sum + price
    // }, 0)
    let totalPrice = 0
    this.data.products.forEach(function (product) {
      let price = product.quantity ? product.price * product.quantity : 0
      totalPrice += price
    })
    this.setData({
      totalPrice: totalPrice
    })
  },

  addToCart: function (product) {
    let Cart = new wx.BaaS.TableObject('carts')
    // console.log(product, quantity)
    if (product.quantity <= 0 && product.cart_id) {
      Cart.delete(product.cart_id).then(function () {
        delete product.cart_id
        wx.showToast({
          title: '删除购物车成功',
        })
      })
    } else if (product.quantity <= 0) {
      return
    } else {
      let cart
      if (product.cart_id) {
        // 不创建新数据，根据id更新数据库中原有数据
        cart = Cart.getWithoutData(product.cart_id)
        cart.set({
          product: product.id,
          quantity: product.quantity,
          price: product.price * product.quantity,
          user: this.data.currentUser.id.toString()
        })
        cart.update().then(function () {
          wx.showToast({
            title: '更新购物车成功',
          })
        })
      } else {
        // 创建新数据
        cart = Cart.create()
        cart.set({
          product: product.id,
          quantity: product.quantity,
          price: product.price * product.quantity,
          user: this.data.currentUser.id.toString()
        })
        cart.save().then(function (res) {
          product.cart_id = res.data.id
          wx.showToast({
            title: '成功加入购物车',
          })
        })
      }
    }
  }
})