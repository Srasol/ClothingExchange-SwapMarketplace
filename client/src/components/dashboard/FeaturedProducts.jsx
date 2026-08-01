import ProductCard from "../product/ProductCard";

function FeaturedProducts({ products = [] }) {
  const featured = products.slice(0, 4);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          🔥 Featured Products
        </h2>

        <button className="text-indigo-600 font-semibold hover:underline">
          View All
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((item) => (
          <ProductCard
            key={item._id}
            product={item}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;