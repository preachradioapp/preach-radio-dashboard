import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/dashboardLayout/DashboardLayout";
import Dashboard from "../components/Dashboard/Dashboard";
import UserManagement from "../page/UserManagement/UserManagement";
import CreatorManagement from "../page/CreatorManagement/CreatorManagement";

import Subscription from "../page/Subscription/Subscription";

import Profile from "../page/Settings/Profile";
import TermsCondition from "../page/Settings/TermsCondition";
import FAQ from "../page/Settings/FAQ";
import PrivacyPolicy from "../page/Settings/PrivacyPolicy";
import Categories from "../page/CategoriesManagement/Categories";
import Subcategory from "../page/CategoriesManagement/Subcategory";

import ForgetPass from "../Auth/ForgetPass";
import Verify from "../Auth/Verify";
import ResetPass from "../Auth/ResetPass";
import Notification from "../page/Notification/Notification";
import About from "../page/Settings/About";
import Login from "../Auth/Login";
import ProtectedRoute from "../protectedRoute/ProtectedRoute";
import Reports from "../page/reports/Reports";
import Support from "../page/Settings/Support";
import Album from "../page/album/Album";
import AlbumDetails from "../page/album/AlbumDetails";
import DetailsMedia from "../page/album/DetailsMedia";
import Banner from "../page/bannar/Banner";
import LinkTerms from "../Auth/LinkTerms";
import LinkPrivecy from "../Auth/LinkPrivecy";
import CreateCreator from "../page/createCreator/CreateCreator";
import Station from "../page/station/Station";
import Reels from "../page/reels/Reels";
import Live from "../page/live/Live";
import Podcast from "../page/podcast/Podcast";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout></DashboardLayout>
      </ProtectedRoute>
     
    ),
    children: [
      {
        path: "/",
        element: <Dashboard></Dashboard>,
      },
      {
        path: "/dashboard/UserManagement",
        element: <UserManagement></UserManagement>,
      },
      {
        path: "/dashboard/CreatorManagement",
        element: <CreatorManagement></CreatorManagement>,
      },
      {
        path: "/dashboard/CategoriesManagement/Categories",
        element: <Categories></Categories>,
      },
      {
        path: "/dashboard/CategoriesManagement/Categories",
        element: <Categories></Categories>,
      },
      {
        path: "/dashboard/CategoriesManagement/Subcategory",
        element: <Subcategory></Subcategory>,
      },
      {
        path: "/dashboard/Subscription",
        element: <Subscription></Subscription>,
      },
      {
        path: "/dashboard/station",
        element: <Station></Station>
      },
      {
        path: "/dashboard/live",
        element: <Live></Live>
      },
      {
        path: "/dashboard/podcast",
        element: <Podcast></Podcast>
      },
       {
        path: "/dashboard/album",
        element: <Album></Album>
      },
      
       {
        path: "/dashboard/reels",
        element: <Reels></Reels>
      },
      {
        path: "/dashboard/albumDetails/:id",
        element: <AlbumDetails></AlbumDetails>
      },
      {
        path: "/dashboard/detailsMedia/:id",
        element: <DetailsMedia></DetailsMedia>
      },
      {
        path: "/dashboard/reports",
        element: <Reports></Reports>
      },
        {
        path: "/dashboard/create-creator",
        element: <CreateCreator></CreateCreator>
      },
      {
        path: "/banner",
        element: <Banner></Banner>
      },
      {
        path: "/dashboard/Settings/profile",
        element: <Profile></Profile>,
      },
      {
        path: "/dashboard/Settings/profile",
        element: <Profile></Profile>,
      },
      {
        path: "/dashboard/Settings/notification",
        element: <Notification></Notification>,
      },
      {
        path: "/dashboard/Settings/Terms&Condition",
        element: <TermsCondition></TermsCondition>,
      },
      {
        path: "/dashboard/Settings/FAQ",
        element: <FAQ></FAQ>,
      },
      {
        path: "/dashboard/Settings/support",
        element: <Support></Support>
      },
      {
        path: "/dashboard/Settings/aboutUs",
        element: <About></About>,
      },
      {
        path: "/dashboard/Settings/PrivacyPolicy",
        element: <PrivacyPolicy></PrivacyPolicy>,
      },
    ],
  },

   {
    path: "/Terms-and-condition",
    element: <LinkTerms></LinkTerms>
  },

   {
    path: "/privecy-policy",
    element: <LinkPrivecy></LinkPrivecy>
  },

  {
    path: "/login",
    element: <Login></Login>,
  },
  
  {
    path: "/forgetpassword",
    element: <ForgetPass></ForgetPass>,
  },
  {
    path: "/verify",
    element: <Verify></Verify>,
  },
  {
    path: "/reset",
    element: <ResetPass></ResetPass>,
  },
]);
