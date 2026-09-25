import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import TargetCursor from "./components/common/TargetCursor";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import IndustryDashboard from "./pages/IndustryDashboard";
import IndustryInternships from "./pages/IndustryInternships";
import AdminDashboard from "./pages/AdminDashboard";

import ForgotPassword from "./pages/ForgotPassword";
import StudentProfile from "./pages/StudentProfile";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
import StudentAssessment from "./pages/StudentAssessment";
import StudentSkills from "./pages/StudentSkills";
import StudentInternships from "./pages/StudentInternships";
import StudentInternshipDetails from "./pages/StudentInternshipDetails";
import StudentApplications from "./pages/StudentApplications";

import IndustryCandidates from "./pages/IndustryCandidates";
import IndustryJobs from "./pages/IndustryJobs";

import StudentJobs from "./pages/StudentJobs";
import IndustryJobCandidates from "./pages/IndustryJobCandidates";
import AcademicianProfile from "./pages/AcademicianProfile";
import InstitutionProfile from "./pages/InstitutionProfile";
import AcademicianOpportunities from "./pages/AcademicianOpportunities";
import AcademicianDashboard from "./pages/AcademicianDashboard";


import InstitutionDashboard from "./pages/InstitutionDashboard";
import InstitutionAnalytics from "./pages/InstitutionAnalytics";
import IndustryProfile from "./pages/IndustryProfile";
import StudentCollaborations from "./pages/StudentCollaborations";
import StudentCollaborationOpportunities from "./pages/StudentCollaborationOpportunities";
import CollaborationRequests from "./pages/CollaborationRequests";

import StudentPortfolio from "./pages/StudentPortfolio";
import OAuthCallback from "./pages/OAuthCallback";
import OAuthRoleSelection from "./pages/OAuthRoleSelection";

import Onboarding from "./pages/Onboarding";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <TargetCursor
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
          cursorColor="#ffffff"
          cursorColorOnTarget="#B497CF"
        />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/oauth/role"element={<OAuthRoleSelection />} />
          <Route path="/register" element={<Register />} />
          <Route
                path="/onboarding"
                element={
                  <ProtectedRoute allowIncomplete>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
          <Route
             path="/student"
             element={
               <ProtectedRoute role="student">
                   <AuthenticatedLayout>
                     <StudentDashboard />
                   </AuthenticatedLayout>
               </ProtectedRoute>
             }
           />

          <Route
            path="/industry"
            element={
              <ProtectedRoute role="industry">
                  <AuthenticatedLayout>
                <IndustryDashboard />
                 </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                   <AuthenticatedLayout>
                <AdminDashboard />
                   </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
           <Route
             path="/forgot-password"
             element={<ForgotPassword />}
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="student">
                 <AuthenticatedLayout>
                 <StudentProfile />
                 </AuthenticatedLayout>
               </ProtectedRoute>
            }
          />

         <Route
             path="/student/assessment/:skill"
            element={
              <ProtectedRoute role="student">
              <StudentAssessment />
              </ProtectedRoute>
             }
          
          />
           
           <Route
               path="/student/skills"
               element={
                  <ProtectedRoute role="student">
                  <AuthenticatedLayout>
                  <StudentSkills />
                  </AuthenticatedLayout>
               </ProtectedRoute>
                }
          />
             
             <Route
                 path="/student/internships/:id"
                  element={
                  <ProtectedRoute role="student">
                  <AuthenticatedLayout>
                   <StudentInternshipDetails />
                    </AuthenticatedLayout>
                    </ProtectedRoute>
                 }
              />
           <Route
               path="/student/internships"
               element={
                 <ProtectedRoute role="student">
                 <AuthenticatedLayout>
                  <StudentInternships />
                 </AuthenticatedLayout>
                 </ProtectedRoute>
                  }
            />

            <Route
                  path="/industry/internships"
                  element={
                  <ProtectedRoute role="industry">
                  <AuthenticatedLayout>
                  <IndustryInternships />
                  </AuthenticatedLayout>
                  </ProtectedRoute>
                  }
              />


               <Route
                  path="/student/applications"
                  element={
                  <ProtectedRoute role="student">
                   <AuthenticatedLayout>
                   <StudentApplications />
                   </AuthenticatedLayout>
                 </ProtectedRoute>
                   }
                />

                <Route
                    path="/industry/candidates"
                    element={
                    <ProtectedRoute role="industry">
                    <AuthenticatedLayout>
                    <IndustryCandidates />
                    </AuthenticatedLayout>
                    </ProtectedRoute>
                    }
                />
                 <Route
                    path="/industry/jobs"
                    element={
                    <ProtectedRoute role="industry">
                    <AuthenticatedLayout>
                    <IndustryJobs />
                    </AuthenticatedLayout>
                    </ProtectedRoute>
                     }
                   />
                   <Route
                     path="/student/jobs"
                     element={
                    <ProtectedRoute role="student">
                    <AuthenticatedLayout>
                    <StudentJobs />
                    </AuthenticatedLayout>
                    </ProtectedRoute>
                      }
                   />

                   <Route
                      path="/industry/job-candidates"
                      element={
                      <ProtectedRoute role="industry">
                      <AuthenticatedLayout>
                       <IndustryJobCandidates />
                       </AuthenticatedLayout>
                       </ProtectedRoute>
                       }
                    />

                    <Route
                        path="/academician/profile"
                        element={
                        <ProtectedRoute role="academician">
                         <AuthenticatedLayout>
                         <AcademicianProfile />
                        </AuthenticatedLayout>
                        </ProtectedRoute>
                        }
                     />

                     <Route
                         path="/institution/profile"
                         element={
                         <ProtectedRoute role="institution">
                         <AuthenticatedLayout>
                          <InstitutionProfile />
                          </AuthenticatedLayout>
                          </ProtectedRoute>
                          }
                      />
                      
                      <Route
                          path="/academician/opportunities"
                          element={
                          <ProtectedRoute role="academician">
                          <AuthenticatedLayout>
                          <AcademicianOpportunities />
                          </AuthenticatedLayout>
                           </ProtectedRoute>
                          }
                       />

                      <Route
                          path="/academician/training"
                          element={
                          <ProtectedRoute role="academician">
                          <AuthenticatedLayout>
                          <AcademicianOpportunities />
                          </AuthenticatedLayout>
                          </ProtectedRoute>
                          }
                      />

                       <Route
                           path="/academician/consultancy"
                           element={
                            <ProtectedRoute role="academician">
                            <AuthenticatedLayout>
                            <AcademicianOpportunities />
                            </AuthenticatedLayout>
                            </ProtectedRoute>
                             }
                        />

                        <Route
                            path="/academician/research"
                            element={
                            <ProtectedRoute role="academician">
                            <AuthenticatedLayout>
                             <AcademicianOpportunities />
                           </AuthenticatedLayout>
                            </ProtectedRoute>
                            }
                        />
                         
                         <Route
                             path="/academician"
                              element={
                               <ProtectedRoute role="academician">
                                 <AuthenticatedLayout>
                                    <AcademicianDashboard />
                                 </AuthenticatedLayout>
                                </ProtectedRoute>
                             }
                            />

                            <Route
                               path="/institution"
                               element={
                                 <ProtectedRoute role="institution">
                                    <AuthenticatedLayout>
                                     <InstitutionDashboard />
                                    </AuthenticatedLayout>
                                 </ProtectedRoute>
                               }
                              />

                              <Route
                                path="/institution/analytics"
                                element={
                                  <ProtectedRoute role="institution">
                                    <AuthenticatedLayout>
                                     <InstitutionAnalytics />
                                    </AuthenticatedLayout>
                                 </ProtectedRoute>
                               }
                              />
                              <Route
                                  path="/industry/profile"
                                 element={
                                    <ProtectedRoute role="industry">
                                      <AuthenticatedLayout>
                                       <IndustryProfile />
                                      </AuthenticatedLayout>
                                    </ProtectedRoute>
                                 }
                                />   

                               <Route
                                    path="/student/collaborations"
                                     element={
                                      <ProtectedRoute role="student">
                                         <AuthenticatedLayout>
                                            <StudentCollaborations />
                                         </AuthenticatedLayout>
                                       </ProtectedRoute>
                                    }
                                    /> 

                                    <Route
                                        path="/student/collaboration-opportunities"
                                        element={
                                          <ProtectedRoute role="student">
                                            <AuthenticatedLayout>
                                              <StudentCollaborationOpportunities />
                                            </AuthenticatedLayout>
                                          </ProtectedRoute>
                                        }
                                      />                                                                
                                    <Route
                                   path="/academician/opportunities/:opportunityId/requests"
                                    element={
                                     <ProtectedRoute role="academician">
                                        <AuthenticatedLayout>
                                          <CollaborationRequests />
                                        </AuthenticatedLayout>
                                     </ProtectedRoute>
                                   }
                                  />                                  
                                  <Route
                                    path="/industry/opportunities/:opportunityId/requests"
                                    element={
                                      <ProtectedRoute role="industry">
                                        <                                 AuthenticatedLayout>
                                          <CollaborationRequests />
                                        </AuthenticatedLayout>
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                      path="/institution/opportunities/:opportunityId/requests"
                                      element={
                                        <ProtectedRoute role="institution">
                                          <AuthenticatedLayout>
                                            <CollaborationRequests />
                                          </AuthenticatedLayout>
                                        </ProtectedRoute>
                                      }
                                    />
                                  <Route
                                    path="/student/portfolio"
                                    element={
                                      <ProtectedRoute role="student">
                                        <AuthenticatedLayout>
                                          <StudentPortfolio />
                                        </AuthenticatedLayout>
                                      </ProtectedRoute>
                                    }
                                  />
                   
                                    
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;