import React, { useEffect, useState } from "react";
import axios from "axios";

/*
 Frontend demo que lista cuentas desde el backend a través del Gateway.
*/
function App() {
  const [accounts, setAccounts] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8082";

  useEffect(() => {
    axios.get(`${backendUrl}/api/v1/accounts`)
      .then(res => setAccounts(res.data))
      .catch(err => console.error("Error fetching accounts", err));
  }, [backendUrl]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Rawson - Bank System (Demo)</h1>
      <h2>Cuentas</h2>
      <ul>
        {accounts.map(a => (
          <li key={a.id}>{a.accountNumber} - {a.balance} {a.currency}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
