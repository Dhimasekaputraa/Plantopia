import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import ProductItem from '#models/product_item'
import ProductCategory from '#models/product_category'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class SellerProductController {

  // 1. LIST PRODUK (READ)
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    // Ambil produk user, urutkan dari yang terbaru
    const products = await Product.query()
      .where('userId', user.id)
      .preload('category')
      .preload('items')
      .orderBy('createdAt', 'desc')

    return view.render('pages/marketplace/seller/my_products', { products })
  }

  // 2. FORM TAMBAH (CREATE)
  async create({ view }: HttpContext) {
    const categories = await ProductCategory.all()
    return view.render('pages/marketplace/seller/create_product', { categories })
  }

  // 3. PROSES SIMPAN (STORE)
  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const data = request.all()
    
    // Upload Gambar
    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    let imagePath = null
    if (image) {
      await image.move(app.makePath('resources/uploads/products'), {
        name: `${cuid()}.${image.extname}`
      })
      imagePath = `resources/uploads/products/${image.fileName}`
    }

    // Simpan Produk
    const product = await Product.create({
      userId: user.id,
      productCategoryId: data.category_id,
      name: data.name,
      description: data.description,
      image: imagePath,
    })

    // Simpan Harga & Stok (Item)
    await ProductItem.create({
      productId: product.id,
      sku: `SKU-${cuid()}`,
      qtyInStock: data.stock,
      price: data.price,
    })

    session.flash('notification', { type: 'success', message: 'Product added successfully!' })
    return response.redirect('/marketplace/my-products')
  }

  // 4. FORM EDIT (UPDATE VIEW)
  async edit({ view, params, auth, response }: HttpContext) {
    const user = auth.user!
    
    // Pastikan produk milik user yang login
    const product = await Product.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('items')
      .first()

    if (!product) {
      return response.redirect('/marketplace/my-products')
    }

    const categories = await ProductCategory.all()
    return view.render('pages/marketplace/seller/edit_product', { product, categories })
  }

  // 5. PROSES UPDATE (UPDATE ACTION)
  async update({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!
    const product = await Product.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!product) {
      return response.redirect('/marketplace/my-products')
    }

    const data = request.all()
    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    // Ganti gambar jika ada upload baru
    if (image) {
      await image.move(app.makePath('resources/uploads/products'), {
        name: `${cuid()}.${image.extname}`
      })
      product.image = `resources/uploads/products/${image.fileName}`
    }

    // Update Info Utama
    product.name = data.name
    product.description = data.description
    product.productCategoryId = data.category_id
    await product.save()

    // Update Harga & Stok
    const item = await ProductItem.findBy('product_id', product.id)
    if (item) {
      item.price = data.price
      item.qtyInStock = data.stock
      await item.save()
    }

    session.flash('notification', { type: 'success', message: 'Product updated successfully!' })
    return response.redirect('/marketplace/my-products')
  }

  // 6. PROSES HAPUS (DELETE)
  async destroy({ params, response, auth, session }: HttpContext) {
    const user = auth.user!
    
    const product = await Product.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (product) {
      await product.delete() // Hapus produk (Items ikut terhapus karena Cascade)
      
      session.flash('notification', { type: 'success', message: 'Product deleted successfully!' })
    }

    return response.redirect('back')
  }
}