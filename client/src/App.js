import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import VideoMeetComponent from './pages/videoMeet';
import VerifyPage from './pages/verify';
import Privacy from './pages/privacy';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/home';
import History from './pages/history';
import ResetPW from './pages/resetPW';
import Terms from './pages/terms';


function App() {

  return (
    <>
      <Router>

        <AuthProvider >

          <Routes>

            <Route path='/' element={<LandingPage />} />

            <Route path='/auth' element={<Authentication />} />

            <Route path='/verify' element={<VerifyPage />} /> 

            <Route path='/reset-password' element={<ResetPW />} /> 

            <Route path='/privacy' element={<Privacy />} />
            <Route path='/terms' element={<Terms />} />

            <Route path='/home' element={<Home />} />

            <Route path='/history' element={<History />} />

            <Route
              path="/room/:roomId"
              element={
                <VideoMeetComponent />
              }
            />

          </Routes>

        </AuthProvider>

      </Router>
    </>
  );
}

export default App;
