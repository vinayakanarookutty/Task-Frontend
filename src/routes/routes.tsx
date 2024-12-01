import { NotFound } from "../components/NotFoundPage/NoteFound";
import { createBrowserRouter } from 'react-router-dom'
import { getAppRoutePath, Routes } from "../utils/utils";
import Registration from "../pages/Registration";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
export const router = createBrowserRouter([
    {
        path: getAppRoutePath(Routes.REGISTRATION),
        element: <Registration />,
    },
    {
        path: getAppRoutePath(Routes.LOGIN),
        element: <Login />,
    },
    {
        path: getAppRoutePath(Routes.HOME),
        element: <Profile />,
    },
    {
        path: '*',
        element: <NotFound/>,
    },
]);
if (import.meta.hot) {
    import.meta.hot.dispose(() => router.dispose());
}