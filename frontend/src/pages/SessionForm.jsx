export default function SessionForm() {
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Schedule Session</h2>
      <form className="space-y-4">
        <input className="w-full border p-2 rounded" type="text" placeholder="Student Name" />
        <input className="w-full border p-2 rounded" type="text" placeholder="Counselor Name" />
        <input className="w-full border p-2 rounded" type="date" />
        <button className="w-full bg-green-700 hover:bg-green-800 text-white p-2 rounded">
          Schedule
        </button>
      </form>
    </div>
  )
}
