export default function StaffForm() {
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Staff</h2>
      <form className="space-y-4">
        <input className="w-full border p-2 rounded" type="text" placeholder="Full Name" />
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" />
        <input className="w-full border p-2 rounded" type="text" placeholder="Position/Role" />
        <button className="w-full bg-green-700 hover:bg-green-800 text-white p-2 rounded">
          Save Staff
        </button>
      </form>
    </div>
  )
}
