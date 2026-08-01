import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserPlus,
  FaListAlt,
  FaPhotoVideo,
  FaImages,
  FaChartBar,
  FaDollarSign,
  FaCog,
  FaChevronRight,
} from "react-icons/fa";
import { IoIosLogIn } from "react-icons/io";
import logo from "../../assets/header/logo.png"; 
import { useDispatch } from "react-redux";
import { logout } from "../../page/redux/features/auth/authSlice";
import { RiPlaystationFill } from "react-icons/ri";
import StationIcon from "./StationIcon";
import PodcastIcon from "./PodcastIcon";
import LiveIcon from "./LiveIcon";
import ReelsIcon from "./ReelsIcon";

const items = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <FaHome className="w-5 h-5" />,
    link: "/",
  },
  {
    key: "userManagement",
    label: "User Management",
    icon: <FaUsers className="w-5 h-5" />,
    link: "/dashboard/UserManagement",
  },
  {
    key: "creatorManagement",
    label: "Creator Management",
    icon: <FaUserPlus className="w-5 h-5" />,
    link: "/dashboard/CreatorManagement",
  },
  {
    key: "categoriesManagement",
    label: "Categories Management",
    icon: <FaListAlt className="w-5 h-5" />,
    link: "/dashboard/CategoriesManagement/Categories",
    children: [
      {
        key: "categories",
        label: "Categories",
        link: "/dashboard/CategoriesManagement/Categories",
      },
      {
        key: "subcategory",
        label: "Subcategory",
        link: "/dashboard/CategoriesManagement/Subcategory",
      },
    ],
  },
    {
    key: "station",
    label: "Station",
    icon: <StationIcon className="w-5 h-5" />,

    link: "/dashboard/station",
  },
  {
    key: "album",
    label: "Album",
    icon: <FaPhotoVideo className="w-5 h-5" />,
    link: "/dashboard/album",
  },
    {
    key: "podcast",
    label: "Podcast",
    icon: <PodcastIcon className="w-5 h-5" />,
    link: "/dashboard/podcast",
  },
  {
    key: "live",
    label: "Live",
    icon: <LiveIcon className="w-5 h-5" />,
    link: "/dashboard/live",
  },
  {
    key: "reels",
    label: "Reels",
    icon: <ReelsIcon className="w-5 h-5" />,
    link: "/dashboard/reels",
  },
  {
    key: "banner",
    label: "Banner",
    icon: <FaImages className="w-5 h-5" />,
    link: "/banner",
  },
  {
    key: "reports",
    label: "Reports",
    icon: <FaChartBar className="w-5 h-5" />,
    link: "/dashboard/reports",
  },

  {
    key: "subscription",
    label: "Subscription",
    icon: <FaDollarSign className="w-5 h-5" />,
    link: "/dashboard/Subscription",
  },
  {
    key: "profile",
    label: "Settings",
    icon: <FaCog className="w-5 h-5" />,
    link: "/dashboard/Settings/profile",
    children: [
      { key: "profile", label: "Profile", link: "/dashboard/Settings/profile" },
      { key: "termsc", label: "Terms & Condition", link: "/dashboard/Settings/Terms&Condition" },
      { key: "privacyc", label: "Privacy Policy", link: "/dashboard/Settings/PrivacyPolicy" },
      { key: "faq", label: "FAQ", link: "/dashboard/Settings/FAQ" },
      { key: "support", label: "Support", link: "/dashboard/Settings/support" },
      { key: "about", label: "About Us", link: "/dashboard/Settings/aboutUs" },
    ],
  },
];


const SidBar = () => {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [expandedKeys, setExpandedKeys] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
    const dispatch = useDispatch();
  const contentRef = useRef({});
  useEffect(() => {
    const currentPath = location.pathname;

    const parentItem = items.find(
      (item) =>
        item.link === currentPath ||
        (item.children &&
          item.children.some((child) => child.link === currentPath))
    );

    if (parentItem) {
      setSelectedKey(
        parentItem.children
          ? parentItem.children.find((child) => child.link === currentPath)
              ?.key || parentItem.key
          : parentItem.key
      );

      if (parentItem.children && !expandedKeys.includes(parentItem.key)) {
        setExpandedKeys([...expandedKeys, parentItem.key]);
      }
    }
  }, [location]);

  const onParentClick = (key) => {
    setExpandedKeys((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  // Logout Function
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="custom-sidebar h-[100vh]  bg-[#050505]">
      {/* Logo */}
      <div className="custom-sidebar-logo flex justify-center">
        <img src={logo} alt="Logo" className="w-[160px]" />
      </div>

      {/* Sidebar Menu */}
      <div className="menu-items">
        {items.map((item) => (
          <div key={item.key}>
            <Link
              to={item.link}
              className={`menu-item my-4 mx-5 py-[10px] px-3 flex items-center cursor-pointer ${
                selectedKey === item.key
                  ? "bg-[#EDC4C5] rounded-sm"
                  : "bg-white rounded-sm hover:bg-gray-200"
              }`}
              onClick={(e) => {
                if (item.children) {
                  e.preventDefault(); // Prevent navigation if it has children
                  onParentClick(item.key); // Toggle expanded state
                } else {
                  setSelectedKey(item.key); // Set the selected key for normal links
                }
              }}
            >
              <span className="mr-2">{item.icon}</span>
              <span className="block w-full text-black">{item.label}</span>

              {/* Show dropdown arrow if children exist */}
              {item.children && (
                <FaChevronRight
                  className={`ml-auto transform transition-all duration-300 ${
                    expandedKeys.includes(item.key) ? "rotate-90" : ""
                  }`}
                />
              )}
            </Link>

            {/* Show children menu if expanded */}
            {item.children && (
              <div
                className={`children-menu bg-white -my-2 mx-5  text-black transition-all duration-300 ${
                  expandedKeys.includes(item.key) ? "expanded" : ""
                }`}
                style={{
                  maxHeight: expandedKeys.includes(item.key)
                    ? `${contentRef.current[item.key]?.scrollHeight}px`
                    : "0",
                }}
                ref={(el) => (contentRef.current[item.key] = el)}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.key}
                    to={child.link}
                    className={`menu-item p-[10px] border-b flex items-center cursor-pointer ${
                      selectedKey === child.key
                        ? "bg-[#EDC4C5]"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      setSelectedKey(child.key); // Set the selected key for children
                      setExpandedKeys([]); // Close all expanded items
                    }}
                  >
                    <span className="block w-full text-black">
                      {child.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className=" w-full p-4">
        <button
          onClick={handleLogout}
          className="w-full flex bg-white text-start rounded-sm text-black p-[10px]"
        >
          <span className="text-2xl">
            <IoIosLogIn />
          </span>
          <span className="ml-3">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default SidBar;
