/** Anpassningslager: Lovables vyer körs med projektets React Router. */
import React from "react";
import { Link as RouterLink, Navigate, useNavigate as useRRNavigate, useParams, useSearchParams } from "react-router-dom";

export function Link({ to, params, search, activeOptions, ...props }: any) {
  let path = to || "/";
  for (const [k,v] of Object.entries(params || {})) path = path.replace(`$${k}`, encodeURIComponent(String(v)));
  if (search) path += `?${new URLSearchParams(search).toString()}`;
  return <RouterLink to={path} {...props} />;
}
export { Navigate };
export function useNavigate() {
  const nav = useRRNavigate();
  return ({ to, search, replace }: {to:string; search?:Record<string,string>; replace?:boolean}) => {
    const qs = search ? `?${new URLSearchParams(search).toString()}` : "";
    nav(to + qs, {replace});
  };
}
export function createFileRoute(_path: string) {
  return (config: any) => ({
    ...config,
    useParams: () => useParams(),
    useSearch: () => {
      // useSearchParams är en hook och används bara från React-komponenter.
      const [params] = useSearchParams();
      return Object.fromEntries(params.entries());
    },
  });
}
