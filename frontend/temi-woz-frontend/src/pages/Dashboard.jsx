import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Robot Control Dashboard</h2>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <Link to="/wizard" className="btn btn-primary">
          Go to Wizard Interface
        </Link>
        <Link to="/observer" className="btn btn-primary">
          Go to Observer Page
        </Link>
        <Link to="/participant-sync" className="btn btn-primary">
          Go to Participant Page (SYNC)
        </Link>
        <Link to="/participant-async" className="btn btn-primary">
          Go to Participant Page (ASYNC)
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
