import NavBar from "./Components/NavBar";
import Login1 from "./Service Provider/Login/WelcomeBackPage";
import Login2 from "./Service Provider/Login/ForgotPwdPage";
import Login3 from "./Service Provider/Login/PwdResetPage";
import Login4 from "./Service Provider/Login/SetNewPwdPage";
import Login5 from "./Service Provider/Login/AllDonePage";
import SignUp1 from "./Service Provider/SignUp/GetStartedPage";
import SignUp2 from "./Service Provider/SignUp/SetupYourAccountPage";
import SignUp3 from "./Service Provider/SignUp/SetupYourLocationPage";
import SignUp4 from "./Service Provider/SignUp/VerifyYourIdPage";
import SignUp5 from "./Service Provider/SignUp/SetupYourImagePage";
import SignUp6 from "./Service Provider/SignUp/SignupCompletePage";
import Profile from "./Service Provider/Profile";
import ProfileEdit from "./Service Provider/EditProfile";
import LandingPage from "./Landing Page/LandingPage";
import BrowsePage from "./Pages/BrowsePlace";
import PostAdd from "./Service Provider/PostAdd";
import SelectRole from "./Main Login Screens/SelectRole";
import HaveAccount from "./Main Login Screens/HaveAccount";
import AdminDashboard from "./Admin/AdminDashboard";

function App() {
  return (
    <>
      <NavBar />
      <Profile />
      <ProfileEdit />
      <LandingPage />
      <AdminDashboard />

      <BrowsePage />
      <PostAdd />
      <SelectRole />
      <HaveAccount />
      <Login1 />
      <Login2 />
      <Login3 />
      <Login4 />
      <Login5 />
      <SignUp1 />
      <SignUp2 />
      <SignUp3 />
      <SignUp4 />
      <SignUp5 />
      <SignUp6 />
    </>
  );
}

export default App;
