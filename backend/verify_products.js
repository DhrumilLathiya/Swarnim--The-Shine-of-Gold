async function testBackend() {
    try {
        console.log("Fetching products with category='ring'...");
        const response = await fetch('http://localhost:3000/products?category=ring&limit=50');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testBackend();
