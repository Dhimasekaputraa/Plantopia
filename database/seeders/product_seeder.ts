import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import User from '#models/user'
import ProductCategory from '#models/product_category'
import ProductItem from '#models/product_item'
import UserReview from '#models/user_review'

export default class extends BaseSeeder {
  async run() {
    // 1. Kategori
    const indoor = await ProductCategory.updateOrCreate({ categoryName: 'Indoor' }, { categoryName: 'Indoor' })
    const outdoor = await ProductCategory.updateOrCreate({ categoryName: 'Outdoor' }, { categoryName: 'Outdoor' })
    const succulent = await ProductCategory.updateOrCreate({ categoryName: 'Succulents' }, { categoryName: 'Succulents' })
    const herbs = await ProductCategory.updateOrCreate({ categoryName: 'Herbs' }, { categoryName: 'Herbs' })

    // 2. Penjual
    const sellers = await User.createMany([
      { firstName: 'Sarah', lastName: 'Gardener', email: 'sarah@example.com', password: 'password123', isSeller: true, isActive: true },
      { firstName: 'Mike', lastName: 'Botanist', email: 'mike@example.com', password: 'password123', isSeller: true, isActive: true },
      { firstName: 'Anna', lastName: 'Florist', email: 'anna@example.com', password: 'password123', isSeller: true, isActive: true }
    ])

    // 3. Data Produk
    const productsData = [
      { name: 'Monstera Deliciosa', price: 25, category: indoor, sellerIndex: 0, desc: 'Tanaman hits dengan daun berlubang artistik.' },
      { name: 'Pothos Golden', price: 18, category: indoor, sellerIndex: 1, desc: 'Tanaman merambat dengan daun corak emas.' },
      { name: 'Snake Plant', price: 20, category: succulent, sellerIndex: 2, desc: 'Lidah mertua, pembersih udara alami.' },
      { name: 'Bamboo', price: 15, category: indoor, sellerIndex: 1, desc: 'Bambu hoki pembawa keberuntungan.' },
      { name: 'Sunflower', price: 12, category: outdoor, sellerIndex: 0, desc: 'Bunga matahari cerah pembawa energi.' },
      { name: 'Red Rose', price: 20, category: outdoor, sellerIndex: 2, desc: 'Mawar merah klasik lambang cinta.' },
      { name: 'Fresh Mint', price: 8, category: herbs, sellerIndex: 0, desc: 'Daun mint segar untuk teh.' },
      { name: 'Basil Italia', price: 10, category: herbs, sellerIndex: 1, desc: 'Wajib punya untuk pecinta pasta.' }
    ]

    // 4. Koleksi Komentar (Lebih Banyak Variasi)
    const goodComments = [
      "Tanaman sangat segar!", 
      "Pengiriman cepat, packing aman banget.", 
      "Suka banget sama bentuknya, cantik!", 
      "Recomended seller, pasti beli lagi.", 
      "Harganya worth it untuk kualitas segini.",
      "Daunnya lebar dan hijau pekat, suka!",
      "Pas banget buat hiasan meja kerja.",
      "Seller ramah, dikasih bonus pupuk dikit."
    ]
    const badComments = [
      "Daun ada yang layu sedikit pas nyampe.", 
      "Pengiriman agak lama dari estimasi.", 
      "Potnya pecah dikit di pinggir.", 
      "Kurang sesuai ekspektasi, agak kecil.", 
      "Tanaman agak stress pas dateng, untung masih hidup."
    ]

    for (const data of productsData) {
      // Buat Produk (Sold Count acak biar natural)
      const product = await Product.create({
        userId: sellers[data.sellerIndex].id,
        productCategoryId: data.category.id,
        name: data.name,
        description: data.desc,
        image: null,
        soldCount: Math.floor(Math.random() * 50) + 5 // Minimal 5 terjual
      })

      // Buat Item
      await ProductItem.create({
        productId: product.id,
        sku: 'SKU-' + product.id,
        price: data.price,
        qtyInStock: Math.floor(Math.random() * 100) + 10,
      })

      // BUAT REVIEW (3 - 8 Review per produk biar rame)
      const reviewCount = Math.floor(Math.random() * 6) + 3 
      
      for (let i = 0; i < reviewCount; i++) {
        // [LOGIKA BARU] 80% Positif (Bintang 4-5), 20% Negatif (Bintang 1-3)
        const isGood = Math.random() > 0.2 
        
        const rating = isGood 
            ? Math.floor(Math.random() * 2) + 4  // Rating 4 atau 5
            : Math.floor(Math.random() * 3) + 1  // Rating 1, 2, atau 3
            
        const commentList = isGood ? goodComments : badComments
        const comment = commentList[Math.floor(Math.random() * commentList.length)]

        await UserReview.create({
            userId: sellers[Math.floor(Math.random() * sellers.length)].id, // Random user
            productId: product.id,
            rating: rating,
            comment: comment
        })
      }
    }
  }
}