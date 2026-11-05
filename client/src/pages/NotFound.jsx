import { Link } from "react-router-dom";
import Seo from "../components/Seo";
export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <Seo title="Page not found | S.R.T. Company" description="The page you are looking for does not exist." noindex />
      <h1 className="text-5xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white">Back to Home</Link>
    </div>
  );
}
