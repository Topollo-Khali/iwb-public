import React, { useState, useEffect } from 'react';

const QueryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [autoReply, setAutoReply] = useState(null);
  const [queries, setQueries] = useState([]); // State for storing previous queries

  // Fetch previous queries on component mount
  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = () => {
    fetch('http://localhost:3001/api/queries')
      .then(res => res.json())
      .then(data => setQueries(data))
      .catch(err => console.error('Error fetching queries:', err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setAutoReply(null);

    try {
      const response = await fetch('http://localhost:3001/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (data.autoReplied) {
          setAutoReply(data.reply);
        }
        setFormData({ name: '', email: '', message: '' });
        fetchQueries(); // Refresh queries after submission
      } else {
        throw new Error(data.error || 'Failed to submit query');
      }
    } catch (error) {
      alert('Failed to submit query: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>Contact Us</h2>
      {success ? (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'green' }}>Thank you! Your query has been submitted.</p>
          {autoReply && <p style={{ color: 'blue' }}>Auto-reply: {autoReply}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ padding: '8px' }}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: '8px' }}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            style={{ padding: '8px', minHeight: '100px' }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </form>
      )}

      <h2>Previous Queries and Responses</h2>
      {queries.length > 0 ? (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Response</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          <tbody>
            {queries.map(query => (
              <tr key={query.id}>
                <td>{query.name}</td>
                <td>{query.email}</td>
                <td>{query.message}</td>
                <td>{query.reply_text || 'N/A'}</td>
                <td>{new Date(query.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No queries with responses available.</p>
      )}
    </div>
  );
};

export default QueryForm;