import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  Link,
  RouterProvider,
  redirect
} from '@tanstack/react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Tasks } from './pages/Tasks';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 t ext-gray-900 font-sans">
      {/* Navigation Bar */}
      <nav className='bg-white shadow-sm px-6 py-4 flex-justify-between items-center border-b'>
        <h1 className='font-extrabold text-xl tracking-right'>Task Forge</h1>
        <div className='flex gap-6 text-sm font-medium'>
          <Link to="/tasks" className="[&.active]:text-blue-600 hover:text-blue-500">Tasks</Link>
          <Link to="/login" className="[&.active]:text-blue-600 hover:text-blue-500">Login</Link>
          <Link to="/register" className="[&.active]:text-blue-600 hover:text-blue-500">Register</Link>
        </div>
      </nav>
      {/* Main Content Area */}
      <main className='p-6 max-w-5xl mx-auto'>
        <Outlet />{/*Child routes will go here */}
      </main>
    </div>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  beforeLoad: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw redirect({ to: '/login' });
    }
  },
  component: Tasks,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/tasks' });
  }
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, registerRoute, tasksRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
