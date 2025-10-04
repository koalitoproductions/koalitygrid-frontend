import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Layout from './components/Layout';
import CalculationsSection from './components/CalculationsSection';
import ConversionsSection from './components/ConversionsSection';
import FormulasSection from './components/FormulasSection';
import Dictionary from './components/Dictionary';
import ErrorPage from './components/ErrorPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import EditAccount from './components/EditAccount';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/berakningar" element={<CalculationsSection />} />
            <Route path="/omvandling" element={<ConversionsSection />} />
            <Route path="/formler" element={<FormulasSection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ordlista" element={<Dictionary />} />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <EditAccount />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<CalculationsSection />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Layout>
      </Router>  
    </AuthProvider>
  );
}

export default App;