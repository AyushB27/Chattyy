import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./screens/AuthSCreen";
import ChatScreen from "./screens/ChatScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
            <Route
      path="/auth"
      element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      }
    />


        {/* CHAT */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatScreen />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
