// React + Tailwind: Reminder History / Timeline Page

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

export default function ReminderTimelinePage() {
  const { user } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            params: {
              userId: user._id
            }
          }
        );
        setReminders(response.data);
      } catch (err) {
        setError("Failed to fetch reminders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [user]);

  const handleNotificationClick = async (notificationId, appointmentId) => {
    try {
      // Mark notification as read
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update local state
      setReminders(reminders.map(reminder => 
        reminder._id === notificationId 
          ? { ...reminder, read: true }
          : reminder
      ));

      // If there's an associated appointment, you might want to navigate to it
      if (appointmentId) {
        // Navigate to appointment details or handle accordingly
        console.log("Navigate to appointment:", appointmentId);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_confirmation':
        return '✅';
      case 'reminder':
        return '⏰';
      case 'new_slot':
        return '📢';
      case 'cancellation':
        return '❌';
      default:
        return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Reminder History & Notifications</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {reminders.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No notifications yet</p>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`flex gap-4 items-start p-4 rounded-lg ${
                    !reminder.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(reminder._id, reminder.appointmentId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="text-2xl">{getNotificationIcon(reminder.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{reminder.title}</h3>
                    <p className="text-sm text-gray-600">{reminder.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(reminder.createdAt)}
                    </p>
                  </div>
                  {!reminder.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
