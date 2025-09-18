import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import HelloWorld from '@/pages/HelloWorld';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HelloWorld />
      }
    ]
  }
]);

export default router;