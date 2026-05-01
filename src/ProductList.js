import { useEffect, useState } from "react";
import axios from "axios";

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("https://vridhi-api.onrender.com/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Saved Products</h2>

      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.category}</p>
          <p>{p.price}</p>
          <p>{p.description}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default ProductList;