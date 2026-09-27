import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Cliente from './pages/Cliente';
import Vendedor from './pages/Vendedor';
import Admin from './pages/Admin';

import ProtectedRoute
    from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/cliente"
                    element={
                        <ProtectedRoute
                            roles={['cliente']}
                        >
                            <Cliente />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendedor"
                    element={
                        <ProtectedRoute
                            roles={['vendedor']}
                        >
                            <Vendedor />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            roles={['admin']}
                        >
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;