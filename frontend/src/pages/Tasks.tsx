import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: number;
};

export function Tasks() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiFetch('/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<{ tasks: Task[] }>;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        <p>Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
        Error loading tasks: {error.message}
      </div>
    );
  }

  const tasks = data?.tasks || [];

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
        <p className="text-gray-500 mt-1">Get started by creating a new task.</p>
        {/* We will add the "Create Task" button here in Phase 4 */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
      </div>

      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="font-semibold text-gray-900">{task.title}</h3>

            <div className="flex gap-2 mt-2">
              {/* Status Badge */}
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${task.status === 'TODO' ? 'bg-gray-100 text-gray-700' : ''}
                ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : ''}
                ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : ''}
              `}>
                {task.status.replace('_', ' ')}
              </span>

              {/* Priority Badge */}
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                Priority: {task.priority}
              </span>
            </div>
          </div>

          {/* We will add Edit/Delete buttons here later */}
        </div>
      ))}
    </div>
  );
}
