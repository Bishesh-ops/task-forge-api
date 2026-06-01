import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: number;
};

export function Tasks() {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiFetch('/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<{ tasks: Task[] }>;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: { title: string; priority: number }) => {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      setNewTaskTitle('');
      setNewTaskPriority(1);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async( { id, status}: {id: string; status: string})=>{
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({status}),
      });
      if(!res.ok) throw new Error('Faild to update task');
    return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['tasks']}),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleCreateTask = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate({ title: newTaskTitle, priority: newTaskPriority });
  }; 

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === 'TODO') return 'IN_PROGRESS';
    if (currentStatus === 'IN_PROGRESS') return 'DONE';
    return 'TODO';
  };

  if (isLoading) return <div className="text-center mt-10">Loading tasks...</div>;
  if (error) return <div className="text-red-500 mt-10">Error: {error.message}</div>;

  const tasks = data?.tasks || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
      </div>
      <form 
        onSubmit={handleCreateTask} 
        className="bg-white p-4 rounded-lg border shadow-sm flex gap-4 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Task</label>
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={createTaskMutation.isPending}
          />
        </div>
        
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select 
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(Number(e.target.value))}
            className="w-full p-2 border rounded-md outline-none"
            disabled={createTaskMutation.isPending}
          >
            {[1, 2, 3, 4, 5].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={createTaskMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No tasks yet. Create one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              
              <div>
                <h3 className={`font-semibold ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                
                <div className="flex gap-2 mt-2 items-center">
                  <button 
                    onClick={() => updateTaskMutation.mutate({ id: task.id, status: getNextStatus(task.status) })}
                    disabled={updateTaskMutation.isPending}
                    className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-colors hover:opacity-80
                      ${task.status === 'TODO' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                      ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                      ${task.status === 'DONE' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                    `}
                  >
                    {task.status.replace('_', ' ')}
                  </button>

                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                    Priority: {task.priority}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    deleteTaskMutation.mutate(task.id);
                  }
                }}
                disabled={deleteTaskMutation.isPending}
                className="text-red-500 hover:text-red-700 p-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Delete
              </button>
              
            </div>
          ))}
        </div>
      )}    
    </div>
  );
}
