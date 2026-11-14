import { useSearchParams } from "react-router-dom";
import CategoryExplorer from "../components/CategoryExplorer";
import Seo from "../components/Seo";
import { categories } from "../data/catalog";
import { seo } from "../data/content";

const total = categories.reduce((n, c) => n + c.items.length, 0);

export default function Products() {
  const [params] = useSearchParams();
  const cat = params.get("category");
  const valid = categories.some((c) => c.id === cat) ? cat : undefined;
  const category = categories.find((c) => c.id === valid);

  // Category URL par us category ka apna title/description, warna general products page ka
  const title = category
    ? `${category.name} Supplier | S.R. Trading Company`
    : seo.products.title;
  const description = category
    ? `${category.name} supplier in New Delhi. ${category.tagline}. Request a quote.`
    : `${total} product lines in ${categories.length} categories: electrical equipment, cables, instruments, safety, earthing and hardware. Request a quote.`;

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={category ? `/products?category=${valid}` : "/products"}
      />
      <CategoryExplorer key={valid || "all"} initialCategory={valid} />
    </>
  );
}
