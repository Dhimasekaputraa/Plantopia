import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'
import Like from '#models/like'
import Product from '#models/product' // PENTING: Import Product
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const users = await User.all()
    const products = await Product.all() // Ambil semua produk
    
    if (users.length === 0) return

    // Caption Bervariasi
    const postContents = [
        "Baru saja menyiram Monstera kesayanganku! 🌿 Seger banget liatnya.",
        "Tips: Jangan lupa kasih pupuk NPK setiap 2 minggu sekali ya guys! 💡",
        "Akhirnya nemu pot tanah liat yang estetik buat kaktus mini. 🌵✨",
        "Minggu pagi saatnya repotting Anggrek Bulan. Wish me luck! 🌸💪",
        "Panen kangkung hidroponik hari ini! Siap dimasak tumis. 🥗😋",
        "Ada yang tau kenapa daun anggrek saya menguning? Butuh saran dong suhu! 🤔🥀",
        "Selamat pagi Plantopia! Semangat menghijaukan bumi. 🌍💚"
    ]

    const commentsText = [
        "Wah keren banget kak! 😍",
        "Setuju banget! 👍",
        "Boleh minta tips perawatannya?",
        "Cantik banget tanamannya 🌿",
        "Semangat kak!",
        "Makasih infonya ya!",
        "Izin save gambarnya kak."
    ]

    for (const user of users) {
      // Setiap user buat 1-4 post
      const postCount = Math.floor(Math.random() * 4) + 1;

      for (let i = 0; i < postCount; i++) {
        // Waktu acak (0-5 hari lalu)
        const randomDays = Math.floor(Math.random() * 5);
        const randomHours = Math.floor(Math.random() * 24);
        const createdAt = DateTime.now().minus({ days: randomDays, hours: randomHours });

        // LOGIKA GAMBAR (PINJAM DARI PRODUK)
        let randomImage = null
        // 50% Peluang postingan punya gambar
        if (Math.random() > 0.5 && products.length > 0) { 
             const randomProduct = products[Math.floor(Math.random() * products.length)]
             randomImage = randomProduct.image // Ambil path gambar produk
        }

        const post = await Post.create({
          userId: user.id,
          content: postContents[Math.floor(Math.random() * postContents.length)],
          image: randomImage, 
          createdAt: createdAt,
          updatedAt: createdAt
        })

        // Like Acak (5 - 20 like)
        const likeCount = Math.floor(Math.random() * 15) + 5;
        const likers = users.sort(() => 0.5 - Math.random()).slice(0, likeCount);
        
        for (const liker of likers) {
          try {
            await Like.create({
                userId: liker.id,
                postId: post.id,
                createdAt: createdAt.plus({ minutes: Math.floor(Math.random() * 60) })
            })
          } catch(e) {} 
        }

        // Komentar Acak (1 - 5 komen)
        const commentCount = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < commentCount; j++) {
          const commenter = users[Math.floor(Math.random() * users.length)];
          await Comment.create({
            userId: commenter.id,
            postId: post.id,
            content: commentsText[Math.floor(Math.random() * commentsText.length)],
            createdAt: createdAt.plus({ minutes: Math.floor(Math.random() * 120) }) 
          })
        }
      }
    }
  }
}