import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import SKUs from './pages/SKUs';
import Shipments from './pages/Shipments';
import BuyerPortal from './pages/BuyerPortal';
import DocsViewer from './pages/DocsViewer';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/orders',
    element: <Orders />,
  },
  {
    path: '/orders/:id',
    element: <OrderDetails />,
  },
  {
    path: '/skus',
    element: <SKUs />,
  },
  {
    path: '/shipments',
    element: <Shipments />,
  },
  {
    path: '/buyer-portal',
    element: <BuyerPortal />,
  },
  {
    path: '/documents',
    element: <DocsViewer />,
  },
]);

export default router;
