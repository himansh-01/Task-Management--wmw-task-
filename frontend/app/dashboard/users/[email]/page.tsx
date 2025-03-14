"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface Task {
  _id: number;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dueDate: Date;
  assignedBy: string;
  assignedTo: string;
  createdAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  profilePhoto?: string;
  verified: boolean;
}

export default function UserDetailPage({ params }: { params: { email: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Modal input states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [taskDueDate, setTaskDueDate] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_ROUTE}/user/one/${params.email}`
        );
        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_ROUTE}/task/one/${params.email}`
        );

        setUser(userResponse.data);
        setUserTasks(tasksResponse.data);
      } catch (error) {
        toast.error("Failed to load user information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [params.email, process.env.NEXT_PUBLIC_ROUTE]);

  const handleAddTask = () => {
    setShowModal(true); // Show the modal
  };

  const handleSubmitTask = async () => {
    if (!user) return;

    if (!taskTitle || !taskDescription || !taskDueDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      status: taskStatus,
      dueDate: new Date(taskDueDate),
      assignedBy: "admin",
      assignedTo: user.email,
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROUTE}/task/add`, newTask);
      setUserTasks([...userTasks, response.data]);
      toast.success("Task added successfully");
      setShowModal(false);
      resetModalFields();
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const resetModalFields = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('pending');
    setTaskDueDate('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-4"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="space-x-2">
          <Button onClick={handleAddTask}>Add Task</Button>
          <button
            onClick={() => router.push("/dashboard/users")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Users
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-2xl">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="h-16 w-16 rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Assigned Tasks</h3>

          {userTasks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding Task */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as Task["status"])}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => { setShowModal(false); resetModalFields(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitTask} className="bg-blue-600 text-white">
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
