import { getAllProducts } from '@/lib/actions/product.actions';
import ProductCard from '@/components/shared/product/product-card';

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const { q = 'all', category = 'all', price = 'all', rating = 'all', sort = 'newest', page = '1' } = await props.searchParams;

  const products = await getAllProducts({
    query: q === 'all' ? '' : q,
    category: category === 'all' ? undefined : category,
    price: price === 'all' ? undefined : price,
    rating: rating === 'all' ? undefined : rating,
    sort: sort === 'newest' ? undefined : sort,
    page: Number(page),
    limit: 100, 
  });

  return (
    <div className='grid md:grid-cols-5 md:gap-5'>
      <div className="filter-links">
        {/* FILTERS */}
      </div>
      <div className='md:col-span-4 space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {products.data.length === 0 && <div>No products found</div>}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 