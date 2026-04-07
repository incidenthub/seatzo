import useSeatPolling from "./hooks/useSeatPolling";
import SeatGrid from "./components/SeatGrid";
import LivePrice from "./components/LivePrice";

function App() {
  const eventId = "69d0de61feb5e5771ce5e1b4";

  // ✅ CALL hook here
  const { seats, pricing, loading, refresh } =
    useSeatPolling(eventId);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <LivePrice pricing={pricing} />

      <SeatGrid
        eventId={eventId}
        seats={seats}
        refresh={refresh}
      />
    </div>
  );
}

export default App;