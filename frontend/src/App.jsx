import { useState } from 'react'
import './index.css'
import Layout from './UI/components/layout'
import { Route, Routes } from 'react-router-dom';
import { LandingPage } from './UI/pages/Landingpage';
import { OnboardingPage } from './UI/pages/OnboardingPage';
import Protected from './UI/components/ProtectedRoute';
import SignInPage from './UI/pages/SignInPage';
import SignUpPage from './UI/pages/SignUpPage';
import OrganizationPage from './UI/pages/OrganizationPage';
import CreateProjectPage from './UI/pages/CreateProjectPage';
import { Toaster } from 'react-hot-toast'
import ProjectPage from './UI/pages/ProjectPage';
import { SocketProvider } from './UI/components/SocketProvider';


function App() {
  return (
    <Layout>
      <Toaster position='bottom right' reverseOrder={true} />
      <SocketProvider>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/sign-in/*' element={<SignInPage />}/>
        <Route path='/sign-up/*' element={<SignUpPage />}/>
        <Route path='/onboarding' element={
          <Protected>
            <OnboardingPage />
          </Protected>
        }/>
        <Route path='/organization/:slug' element={
          <Protected>
            <OrganizationPage />
          </Protected>
        }/>
        <Route path='/project' element={
          <Protected>
            <CreateProjectPage />
          </Protected>
        }/>
        <Route path='/:slug/project/:projId' element={
          <Protected>
            <ProjectPage />
          </Protected>
        }/>
      </Routes>
      </SocketProvider>
    </Layout>
  )
}

export default App
