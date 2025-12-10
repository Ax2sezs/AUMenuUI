export default function RecommendMenu() {
  const branch = "Siam Square"
  const recommend = [
    { name: "Thai Tea Bingsu", reason: "Top pick in Siam Square" },
    { name: "Durian Lava", reason: "Local favorite" }
  ]

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">🏆 Recommended for {branch}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {recommend.map((r, i) => (
          <div key={i} className="card bg-base-100 shadow-lg p-4">
            <h3 className="font-semibold">{r.name}</h3>
            <p className="text-sm opacity-70">{r.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
