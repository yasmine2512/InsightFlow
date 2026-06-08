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



function App() {
  return (
    <>
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register/>} />
<Route path="/" element={<Home/>} />
{/* <Route path="/products/new" element={<ProductForm/>} /> */}
<Route element={<DashboardLayout />}>
<Route path="/:id/dashboard" element={<Dashboard/>} />
<Route path="/:id/customers" element={<Customers/>} />
<Route path="/products/:productid" element={<ProductsDetailsAdmin />} />
{/* <Route path="/products/:id" element={<ProductsDetailsuser />} /> */}
<Route path="/:id/cataloge" element={<ProductsCataloge />} />
<Route path="/:id/products" element={<Products/>} />
<Route path="/products/dashboard" element={<Products />} />
<Route path="/:id/orders" element={<Orders/>} />
<Route path="/settings" element={<Settings/>} />
<Route path="/subscriptions" element={<Subscriptions/>} />
</Route>
<Route path="*" element={<NotFound />} />


</Routes>
    </>
  )
}

export default App
