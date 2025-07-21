export default function RiderTable({ riders }) {
  return (
    <table className="min-w-full w-full bg-white text-gray-900">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th>
        </tr>
      </thead>
      <tbody>
        {riders.map(rider => (
          <tr key={rider._id}>
            <td>{rider.name}</td>
            <td>{rider.email}</td>
            <td>{rider.phone}</td>
            <td>{rider.address}</td>
            <td>{new Date(rider.joinedAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
