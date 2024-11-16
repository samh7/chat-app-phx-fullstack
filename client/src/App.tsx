import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import ChatRoom from "./components/ChatRoom";
import ChatLimitExceded from "./pages/ChatLimitExceded";

export default function App() {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/chat",
      element: <ChatRoom />,
    },
    {
      path: "/limited",
      element: <ChatLimitExceded />,
    },
  ];

  return <RouterProvider router={createBrowserRouter(routes)} />;
}
