// pages/products/products.js
Page({

  data: {
    products: [],
    carts: [],
    currentUser: null,
    totalPrice: 0
  },

  onLoad: function (options) {
    this.fetchProducts()
    wx.BaaS.auth.getCurrentUser().then(user => {
      this.setData({
        currentUser: user
      })
    })
  },

  fetchProducts: function () {
    let page = this
    let Product = new wx.BaaS.TableObject('products')
    Product.find().then(res => {
      this.setData({
        products: res.data.objects
      })
      page.fetchCarts()
    })
  },

  fetchCarts: function () {
    let Cart = new wx.BaaS.TableObject('carts')
    Cart.find().then(res => {
      this.setData({
        carts: res.data.objects
      })
      let carts = this.data.carts
      this.data.products.forEach(product => {
        //
        let cart = carts.find(cart => cart.product.id == product.id)
        if (cart) {
          product.quantity = cart.quantity
          product.cart_id = cart.id
        }
      })
      this.setData({
        products: this.data.products
      })
      this.updateTotalPrice()
    })
  },

  onAdd: function (event) {
    let productId = event.currentTarget.dataset.id
    // 
    let product = this.data.products.find(product => product.id == productId)
    if (product.quantity) {
      product.quantity += 1
    } else {
      product.quantity = 1
    }
    this.setData({
      products: this.data.products
    })
    this.addToCart(product)
    this.updateTotalPrice()
  },

  onMinus: function (event) {
    let productId = event.currentTarget.dataset.id
    // 
    let product = this.data.products.find((product) => product.id == productId)
    if (product.quantity) {
      product.quantity -= 1
    }
    this.setData({
      products: this.data.products
    })
    this.addToCart(product)
    this.updateTotalPrice()
  },

  addToCart: function (product) {
    // debugger
    let Cart = new wx.BaaS.TableObject('carts')
    if (product.quantity <= 0 && product.cart_id) {
      Cart.delete(product.cart_id).then(function () {
        delete product.cart_id
        wx.showToast({
          title: '删除购物车成功',
        })
      })
    } else if (!product.quantity || product.quantity <= 0) {
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
        cart.save().then(res => {
          product.cart_id = res.data.id
          wx.showToast({
            title: '成功加入购物车',
          })
        })
      }
    }
  },

  updateTotalPrice: function () {
    let totalPrice = this.data.products.reduce((sum, product) => {
      let price = product.price * (product.quantity || 0)
      return sum + price
    }, 0)
    this.setData({
      totalPrice: totalPrice
    })
  }
})