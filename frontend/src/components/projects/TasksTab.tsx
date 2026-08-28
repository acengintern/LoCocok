"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Badge from "@/components/ui/badge/Badge";
import ApprovalHistory from "@/components/common/ApprovalHistory";
import ApprovalActions from "@/components/common/ApprovalActions";

interface TasksTabProps {
  projectId: string;
}

interface User {
  id: number;
  name: string;
}

interface TaskAssignment {
  user_id: number;
  user?: User;
}

interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  priority: string;
  task_type?: string;
  assignments?: TaskAssignment[];
}

export default function TasksTab({ projectId }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    task_type: "",
  });

  const [assignData, setAssignData] = useState<{ user_ids: number[] }>({
    user_ids: []
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${projectId}/tasks?include=assignments.user`);
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setTasks(list);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setUsers(list);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
      fetchUsers();
    }
  }, [projectId]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        due_date: task.due_date ? task.due_date.split('T')[0] : "",
        task_type: task.task_type || "",
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
        task_type: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await apiClient.put(`/projects/${projectId}/tasks/${selectedTask.id}`, formData);
      } else {
        await apiClient.post(`/projects/${projectId}/tasks`, formData);
      }
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;
    try {
      await apiClient.delete(`/projects/${projectId}/tasks/${selectedTask.id}`);
      fetchTasks();
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleOpenAssignModal = (task: Task) => {
    setSelectedTask(task);
    const existingAssignees = task.assignments?.map(a => a.user_id) || [];
    setAssignData({ user_ids: existingAssignees });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      await apiClient.put(`/tasks/${selectedTask.id}/assign`, assignData);
      fetchTasks();
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error("Failed to assign users", error);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      setStatusError(null);
      await apiClient.put(`/projects/${projectId}/tasks/${task.id}`, {
        ...task,
        status: newStatus
      });
      fetchTasks();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setStatusError("You do not have permission to update this task's status.");
        setTimeout(() => setStatusError(null), 5000);
      } else {
        setStatusError("An error occurred while updating status.");
        setTimeout(() => setStatusError(null), 5000);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'light';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'review': return 'info';
      case 'pending': return 'light';
      default: return 'light';
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
        <Button onClick={() => handleOpenModal()}>Add Task</Button>
      </div>

      {statusError && (
        <div className="mb-4 p-3 text-sm text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
          {statusError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        </div>
      ) : (!Array.isArray(tasks) || tasks.length === 0) ? (
        <div className="text-center text-gray-500 py-4">No tasks found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>ID</TableCell>
                <TableCell isHeader>Title</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Assignees</TableCell>
                <TableCell isHeader>Priority</TableCell>
                <TableCell isHeader>Due Date</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(tasks) ? tasks : []).map((task) => (
                <TableRow key={task.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableCell>#{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.task_type || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.assignments && task.assignments.length > 0 ? (
                        task.assignments.map(a => (
                          <Badge key={a.user_id} size="sm" color="light">{a.user?.name || `User ${a.user_id}`}</Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Unassigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" color={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Select
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'review', label: 'Review' },
                        { value: 'completed', label: 'Completed' }
                      ]}
                      value={task.status}
                      onChange={(val) => handleStatusChange(task, val)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenAssignModal(task)}>Assign</Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(task)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(task)} className="text-error-500 border-error-500 hover:bg-error-50">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {selectedTask ? "Edit Task" : "Add Task"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Input
              type="text"
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
            />
          </div>
          <div>
            <Label>Priority</Label>
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
              value={formData.priority}
              onChange={(val) => setFormData({ ...formData, priority: val })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'completed', label: 'Completed' }
              ]}
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
        {selectedTask && (
          <div className="mt-8 border-t border-gray-200 dark:border-white/[0.05] pt-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Approvals & Revisions</h4>
            <ApprovalActions targetType="tasks" targetId={selectedTask.id} />
            <ApprovalHistory targetType="tasks" targetId={selectedTask.id} />
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Assign Task</h3>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <Label>Assign Users</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto mt-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    checked={assignData.user_ids.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignData({ user_ids: [...assignData.user_ids, user.id] });
                      } else {
                        setAssignData({ user_ids: assignData.user_ids.filter(id => id !== user.id) });
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} className="bg-error-500 hover:bg-error-600 text-white">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
