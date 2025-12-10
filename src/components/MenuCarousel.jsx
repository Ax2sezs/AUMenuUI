import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import { motion } from "framer-motion"

const menus = [
  { name: "Strawberry Bingsu", img: "https://picsum.photos/300/200?1", price: 220 },
  { name: "Mango Tango", img: "https://picsum.photos/300/200?2", price: 250 },
  { name: "Chocolate Lava", img: "https://picsum.photos/300/200?3", price: 200 },
  { name: "Matcha Delight", img: "https://picsum.photos/300/200?4", price: 240 },
]

export default function MenuCarousel() {
  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">🍨 Popular Menu</h2>
      <Swiper spaceBetween={20} slidesPerView={2}>
        {menus.map((m, i) => (
          <SwiperSlide key={i}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="card bg-base-100 shadow-xl"
            >
              <figure>
                <img src={m.img} alt={m.name} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{m.name}</h2>
                <p>{m.price}฿</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-secondary">Add</button>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
