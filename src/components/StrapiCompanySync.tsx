/** Strapi v5: synkar endast publika företagsuppgifter med prototypens vyer. */
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { getCompanies } from "@/api/companies";
export function StrapiCompanySync() {
 const { actions } = useStore();
 useEffect(() => {
   let cancelled = false;
   getCompanies().then((result) => {
     if (!cancelled && Array.isArray(result?.data)) actions.loadCompaniesFromStrapi(result.data);
   }).catch((err) => console.info("Strapi ej tillgängligt, visar demonstrationsföretag:",err.message));
   return () => {cancelled=true};
 }, [actions]);
 return null;
}
