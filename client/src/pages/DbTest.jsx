// client/src/pages/DbTest.jsx
// A simple page to test the database connection by creating and viewing entries.

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/test';

function DbTest() {
  const [name, setName] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all test entries when the component mounts
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(API_URL);
      setEntries(res.data);
    } catch (error) {
      console.error('Failed to fetch test entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to create a new entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await axios.post(API_URL, { name });
      setEntries([res.data, ...entries]);
      setName('');
    } catch (error) {
      console.error('Failed to create test entry:', error);
    }
  };

  // Toggle the completion status of an entry
  const handleToggle = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`);
      setEntries(entries.map(entry => entry._id === id ? res.data : entry));
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  // Delete an entry from the database
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setEntries(entries.filter(entry => entry._id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center">Todo List (DB Test)</h1>
      <p className="mb-6 text-gray-600 text-center">
        This is a simple Todo list to demonstrate full CRUD (Create, Read, Update, Delete) functionality with the MongoDB database.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 transition"
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
          Add
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Tasks:</h2>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li 
              key={entry._id} 
              className={`flex items-center justify-between p-4 rounded-lg transition ${entry.completed ? 'bg-green-100 text-gray-500' : 'bg-white shadow'}`}
            >
              <span 
                onClick={() => handleToggle(entry._id)}
                className={`cursor-pointer ${entry.completed ? 'line-through' : ''}`}
              >
                {entry.name}
              </span>
              <button 
                onClick={() => handleDelete(entry._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm font-medium"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DbTest;
