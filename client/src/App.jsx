import './App.css'
import { Route,Routes} from 'react-router-dom'
import DashboardLayout from './components/Layout'
import Home from "./Pages/Home"
import Dashboard from "./Pages/Dashboard"
import Login from "./Pages/Login"
import NotFound from "./Pages/NotFound"
import Orders from "./Pages/Orders"
// import Products from "./Pages/Products"
import ProductsDetailsAdmin from "./Pages/ProductDetailsAdmin"
import ProductsCataloge from "./Pages/ProductsAdmin"
import Products from "./Pages/Products"
import Register from "./Pages/Register"
import Settings from "./Pages/Settings"
import Subscriptions from "./Pages/Subsriptions"
import Customers from "./Pages/Customers"
import SubscriptionSucces from "./Pages/SubscriptionSucces"
import OAuth from './Pages/OauthPage'
import ProtectedRoute from './context/ProtectedRoute'

function App() {
  return (
    <>
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register/>} />
<Route path="/" element={<Home/>} />
<Route element={<ProtectedRoute />}>
<Route element={<DashboardLayout />}>
<Route path="/:id/dashboard" element={<Dashboard/>} />
<Route path="/:id/customers" element={<Customers/>} />
<Route path="/:id/catalog" element={<ProductsCataloge />} />
<Route path="/:id/products" element={<Products/>} />
<Route path="/:id/catalog/:productid" element={<ProductsDetailsAdmin />} />
<Route path="/:id/orders" element={<Orders/>} />
<Route path="/settings" element={<Settings/>} />
<Route path="/subscriptions" element={<Subscriptions/>} />
<Route path="/subscription-success" element={<SubscriptionSucces/>} />
</Route></Route>
<Route path="/oauth-success" element={<OAuth/>}/>
<Route path="*" element={<NotFound />} />



</Routes>
    </>
  )
}

export default App
