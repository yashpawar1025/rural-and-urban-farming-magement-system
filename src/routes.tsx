import type { ReactNode } from 'react';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import RuralDashboard from './pages/rural/RuralDashboard';
import CropEncyclopedia from './pages/rural/CropEncyclopedia';
import PlantDiagnosis from './pages/rural/PlantDiagnosis';
import FarmRecords from './pages/rural/FarmRecords';
import CropsManagement from './pages/rural/CropsManagement';
import Livestock from './pages/rural/Livestock';
import Inventory from './pages/rural/Inventory';
import Equipment from './pages/rural/Equipment';
import FinancialManagement from './pages/rural/FinancialManagement';
import Orders from './pages/rural/Orders';
import Weather from './pages/rural/Weather';
import FarmMapping from './pages/rural/FarmMapping';
import Analytics from './pages/rural/Analytics';
import GovernmentSchemes from './pages/rural/GovernmentSchemes';
import UrbanDashboard from './pages/urban/UrbanDashboard';
import CropPlanning from './pages/urban/CropPlanning';
import Irrigation from './pages/urban/Irrigation';
import PlantHealth from './pages/urban/PlantHealth';
import Marketplace from './pages/urban/Marketplace';
import UrbanAnalytics from './pages/urban/Analytics';
import UrbanInventory from './pages/urban/Inventory';
import UrbanWeather from './pages/urban/Weather';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

const routes: RouteConfig[] = [
  { name: 'Login', path: '/login', element: <Login />, public: true },
  { name: 'Register', path: '/register', element: <Register />, public: true },
  { name: 'Profile', path: '/profile', element: <Profile /> },
  { name: 'Settings', path: '/settings', element: <Settings /> },
  { name: 'Rural Dashboard', path: '/rural/dashboard', element: <RuralDashboard /> },
  { name: 'Crop Encyclopedia', path: '/rural/encyclopedia', element: <CropEncyclopedia /> },
  { name: 'Plant Diagnosis', path: '/rural/diagnosis', element: <PlantDiagnosis /> },
  { name: 'Farm Records', path: '/rural/records', element: <FarmRecords /> },
  { name: 'Crops Management', path: '/rural/crops', element: <CropsManagement /> },
  { name: 'Livestock', path: '/rural/livestock', element: <Livestock /> },
  { name: 'Inventory', path: '/rural/inventory', element: <Inventory /> },
  { name: 'Equipment', path: '/rural/equipment', element: <Equipment /> },
  { name: 'Financial', path: '/rural/financial', element: <FinancialManagement /> },
  { name: 'Orders', path: '/rural/orders', element: <Orders /> },
  { name: 'Weather', path: '/rural/weather', element: <Weather /> },
  { name: 'Farm Mapping', path: '/rural/mapping', element: <FarmMapping /> },
  { name: 'Analytics', path: '/rural/analytics', element: <Analytics /> },
  { name: 'Government Schemes', path: '/rural/schemes', element: <GovernmentSchemes /> },
  { name: 'Urban Dashboard', path: '/urban/dashboard', element: <UrbanDashboard /> },
  { name: 'Crop Planning', path: '/urban/planning', element: <CropPlanning /> },
  { name: 'Irrigation', path: '/urban/irrigation', element: <Irrigation /> },
  { name: 'Plant Health', path: '/urban/health', element: <PlantHealth /> },
  { name: 'Marketplace', path: '/urban/marketplace', element: <Marketplace /> },
  { name: 'Urban Analytics', path: '/urban/analytics', element: <UrbanAnalytics /> },
  { name: 'Urban Inventory', path: '/urban/inventory', element: <UrbanInventory /> },
  { name: 'Urban Weather', path: '/urban/weather', element: <UrbanWeather /> },
];

export default routes;
