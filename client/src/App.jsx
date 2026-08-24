import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import AuthScreen from "./screens/AuthScreen";
import ChatScreen from "./screens/ChatScreen";
import ProtectedRoute from "./components/protectedRoute";
import PublicRoute from "./components/publicRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <AuthScreen />
                  </PublicRoute>
                }
              />
              <Route
                path="/auth"
                element={
                  <PublicRoute>
                    <AuthScreen />
                  </PublicRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
