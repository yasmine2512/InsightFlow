import './App.css'
import { Route,Routes} from 'react-router-dom'
import DashboardLayout from './components/Layout'
import Home from "./Pages/Home"
import Dashboard from "./Pages/Dashboard"
import Login from "./Pages/Login"
import NotFound from "./Pages/NotFound"
import Orders from "./Pages/Orders"
import ProductsDetail from "./Pages/ProductDetail"
import ProductsCatalog from "./Pages/ProductsCatalog"
import Products from "./Pages/Products"
import Register from "./Pages/Register"
import Settings from "./Pages/Settings"
import Subscriptions from "./Pages/Subsriptions"
import Customers from "./Pages/Customers"
import SubscriptionSuccess from "./Pages/SubscriptionSuccess"
import SubscriptionCancel from "./Pages/SubscriptionCancel"
import OAuth from './Pages/OauthPage'
import ProtectedRoute from './context/ProtectedRoute'
import VerifySuccess from "./Pages/VerifySuccess"
import ResetPassword from "./Pages/ResetPassword"
import ForgotPassword from './Pages/ForgotPassword'
function App() {
  return (
    <>
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register/>} />
<Route path="/" element={<Home/>} />
<Route element={<ProtectedRoute />}>
<Route element={<DashboardLayout />}>
<Route path="/dashboard" element={<Dashboard/>} />
<Route path="/customers" element={<Customers/>} />
<Route path="/catalog" element={<ProductsCatalog />} />
<Route path="/products" element={<Products/>} />
<Route path="/catalog/:productid" element={<ProductsDetail />} />
<Route path="/orders" element={<Orders/>} />
<Route path="/settings" element={<Settings/>} />
<Route path="/subscriptions" element={<Subscriptions/>} />
<Route path="/subscription-success" element={<SubscriptionSuccess/>} />
<Route path="/subscription-cancel" element={<SubscriptionCancel/>} />
</Route></Route>
<Route path="/verify-success" element={<VerifySuccess />}/>
<Route path="reset-password/:userId/:token" element={<ResetPassword/>} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/oauth-success" element={<OAuth/>}/>
<Route path="*" element={<NotFound />} />

</Routes>
    </>
  )
}

export default App
