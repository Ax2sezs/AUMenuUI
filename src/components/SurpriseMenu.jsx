import { useState } from "react"

const surpriseMenus = [
  "Choco Banana", "Blueberry Cheese", "Honey Toast Bingsu", "Thai Tea Ice"
]

export default function SurpriseMenu() {
  const [menu, setMenu] = useState(null)

  const handleSurprise = () => {
    const random = surpriseMenus[Math.floor(Math.random() * surpriseMenus.length)]
    setMenu(random)
  }

  return (
    <div className="my-6 text-center">
      <h2 className="text-2xl font-bold mb-4">🎲 Surprise Me!</h2>
      <button className="btn btn-accent" onClick={handleSurprise}>Click to Random</button>
      {menu && (
        <div className="alert alert-success mt-4">
          <span>Today’s recommendation: {menu}</span>
        </div>
      )}
    </div>
  )
}
