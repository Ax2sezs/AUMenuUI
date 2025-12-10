export default function TableClosedPage() {
    return (
        <div className="flex h-screen bg-grid-pattern items-center justify-center flex-col text-gray-700">
            <div className="">
                <img src="/logo.png" alt="Logo" className="w-full h-24 mb-4" />
            </div>
            <h1 className="text-2xl font-bold text-black/70">
                {localStorage.getItem("tableNo") || "-"}
            </h1>
            <h1 className="text-2xl font-bold text-black/70">Table Closed</h1>
        </div>
    );
}
