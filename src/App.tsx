import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { Route as Home } from "@/routes/index";
import { Route as Login } from "@/routes/login";
import { Route as Community } from "@/routes/community";
import { Route as Directory } from "@/routes/foretag.index";
import { Route as Company } from "@/routes/foretag.$slug";
import { Route as MyCompany } from "@/routes/mitt-foretag";
import { Route as Events } from "@/routes/event";
import { Route as Contact } from "@/routes/kontakt";
import { Route as Editor } from "@/routes/redaktor";
import { Route as Admin } from "@/routes/admin";
import { Link } from "react-router-dom";
import { StrapiCompanySync } from "@/components/StrapiCompanySync";

const pages = [
 ["/",Home], ["/login",Login], ["/community",Community],
 ["/foretag",Directory], ["/foretag/:slug",Company],
 ["/mitt-foretag",MyCompany], ["/event",Events],
 ["/kontakt",Contact], ["/redaktor",Editor], ["/admin",Admin],
] as const;
function RouteView({component: Component}: {component: React.ComponentType}) {return <Component />;}
export default function App() {
 return <BrowserRouter><StoreProvider>
   <StrapiCompanySync />
   <div className="demo-warning" role="status">DEMONSTRATION – inloggning, roller och de flesta ändringar är simulerade. Endast företagsuppgifter kan hämtas från lokal Strapi.</div>
   <Routes>{pages.map(([path, route]) => <Route key={path} path={path} element={<RouteView component={route.component} />} />)}
     <Route path="*" element={<div className="p-12 text-center"><h1 className="text-3xl font-bold">Sidan finns inte</h1><Link to="/">Till startsidan</Link></div>} />
   </Routes><Toaster richColors />
 </StoreProvider></BrowserRouter>;
}
