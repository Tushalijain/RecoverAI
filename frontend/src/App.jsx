import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://recoverai-backend-avnz.onrender.com/api";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [metricsRes, opportunitiesRes] = await Promise.all([
        axios.get(`${API}/recovery/metrics`),
        axios.get(`${API}/recovery`)
      ]);

      setMetrics(metricsRes.data);
      setOpportunities(opportunitiesRes.data);
    } catch (error) {
      console.error("Dashboard load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const executeRecovery = async (id) => {
    try {
      await axios.post(`${API}/recovery/execute/${id}`);
      await loadData();
    } catch (error) {
      console.error("Recovery execution failed:", error);
      alert("Recovery action failed");
    }
  };

  if (loading) {
    return <h2 className="loading">Loading RecoverAI...</h2>;
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>RecoverAI</h1>
          <p>AI-powered revenue recovery for failed payments</p>
        </div>

        <div className="header-actions">
  <button
    onClick={() =>
      window.open(
        "https://recoverai-backend-avnz.onrender.com/checkout.html",
        "_blank"
      )
    }
  >
    Test ₹500 Payment
  </button>

  <span className="live">● System Live</span>
</div>
      </header>

      <section className="metrics">
        <div className="card">
          <p>Revenue at Risk</p>
          <h2>₹{metrics?.revenueAtRisk || 0}</h2>
        </div>

        <div className="card">
          <p>Recoverable Revenue</p>
          <h2>₹{metrics?.recoverableRevenue || 0}</h2>
        </div>

        <div className="card">
          <p>Recovered Revenue</p>
          <h2>₹{metrics?.recoveredRevenue || 0}</h2>
        </div>

        <div className="card">
          <p>Recovery Rate</p>
          <h2>{metrics?.recoveryRate || 0}%</h2>
        </div>
      </section>

      <section className="table-section">
       <div className="section-header">
  <h2>Recovery Opportunities</h2>

  <button onClick={loadData}>
    Refresh Opportunities
  </button>
</div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>AI Score</th>
                <th>Priority</th>
                <th>Recommended Action</th>
                <th>Status</th>
                <th>Recovery</th>
              </tr>
            </thead>

            <tbody>
              {opportunities.map((item) => (
                <tr key={item._id}>
                  <td>{item.customer?.name || "Customer"}</td>
                  <td>₹{item.amount}</td>
                  <td>{item.recoveryProbability}%</td>
                  <td>
  <span className={`badge priority-${item.priority.toLowerCase()}`}>
    {item.priority}
  </span>
</td>
                  <td>
  <span className="action-text">
    {item.recommendedAction.replaceAll("_", " ")}
  </span>
</td>
                  <td>
  <span className={`badge status-${item.status.toLowerCase()}`}>
    {item.status}
  </span>
</td>
                  <td>
                    {item.status === "RECOMMENDED" &&
 item.recommendedAction !== "NO_ACTION" ? (
                      <button
                        onClick={() => executeRecovery(item._id)}
                      >
                        Execute
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ai-section">
        <h2>AI Analysis</h2>

        {opportunities.length > 0 ? (
          <div className="analysis-card">
            <h3>{opportunities[0].customer?.name || "Customer"}</h3>

            <p>
              <strong>Recovery Probability:</strong>{" "}
              {opportunities[0].recoveryProbability}%
            </p>

            <p>
              <strong>Reason:</strong> {opportunities[0].reason}
            </p>

            <p>
              <strong>AI Recommendation:</strong>{" "}
              {opportunities[0].recommendedAction}
            </p>
          </div>
        ) : (
          <p>No recovery opportunities yet.</p>
        )}
      </section>
    </div>
  );
}

export default App;