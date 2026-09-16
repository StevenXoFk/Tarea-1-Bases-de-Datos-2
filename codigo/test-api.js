const BASE_URL = "http://localhost:3000/api/products";

async function run() {
    console.log("1) GET /api/products");
    let res = await fetch(BASE_URL);
    let all = await res.json();
    console.log(`   status ${res.status} - ${Array.isArray(all) ? all.length : "?"} productos`);

    console.log("2) GET /api/products/with-category");
    res = await fetch(`${BASE_URL}/with-category`);
    let withCategory = await res.json();
    console.log(`   status ${res.status} - ${Array.isArray(withCategory) ? withCategory.length : "?"} productos`);

    console.log("3) POST /api/products");
    res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Bici Test API",
            productNumber: `BT-API-${Date.now()}`,
            color: "Verde",
            standardCost: 100,
            listPrice: 150,
            subcategoryID: 1
        })
    });
    let created = await res.json();
    console.log(`   status ${res.status}`, created);
    const productId = created.productId;

    if (!productId) {
        console.error("No se pudo crear el producto, se detienen las pruebas de UPDATE/DELETE");
        return;
    }

    console.log(`4) PUT /api/products/${productId}`);
    res = await fetch(`${BASE_URL}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Bici Test API Actualizada",
            color: "Azul",
            standardCost: 120,
            listPrice: 180,
            subcategoryID: 1
        })
    });
    console.log(`   status ${res.status}`, await res.json());

    console.log(`5) DELETE /api/products/${productId}`);
    res = await fetch(`${BASE_URL}/${productId}`, { method: "DELETE" });
    console.log(`   status ${res.status}`, await res.json());
}

run().catch(err => console.error("Error en las pruebas:", err));
