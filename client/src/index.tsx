import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ConnectionContext, connection } from './connection'
import { store } from './store';
import { Provider } from 'react-redux';
import {
  createHashRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import ErrorPage from './ErrorPage';
import Welcome from './components/Welcome';
import Level from './components/Level';
import { monacoSetup } from 'lean4web/client/src/monacoSetup';

monacoSetup()


const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Welcome />,
      },
      {
        path: "/level/:levelId",
        element: <Level />,
      },
    ],
  },
]);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConnectionContext.Provider value={connection}>
        <RouterProvider router={router} />
      </ConnectionContext.Provider>
    </Provider>
  </React.StrictMode>
);
