// Run: node scripts/seedDummyData.js
import "../config/env.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

/* ------------------------------------------------------------------ */
/*  Source: https://dummyjson.com/products (stripped to your schema)   */
/* ------------------------------------------------------------------ */

const RAW = [
  { title: "Essence Mascara Lash Princess", description: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.", category: "beauty", price: 9.99, discountPercentage: 10.48, brand: "Essence", stock: 99, images: ["https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"] },
  { title: "Eyeshadow Palette with Mirror", description: "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.", category: "beauty", price: 19.99, discountPercentage: 18.19, brand: "Glamour Beauty", stock: 34, images: ["https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/1.png"] },
  { title: "Powder Canister", description: "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.", category: "beauty", price: 14.99, discountPercentage: 9.84, brand: "Velvet Touch", stock: 89, images: ["https://cdn.dummyjson.com/products/images/beauty/Powder%20Canister/1.png"] },
  { title: "Red Lipstick", description: "The Red Lipstick is a classic and bold choice for adding a pop of color to your lips. With a creamy and pigmented formula, it provides a vibrant and long-lasting finish.", category: "beauty", price: 12.99, discountPercentage: 12.16, brand: "Chic Cosmetics", stock: 91, images: ["https://cdn.dummyjson.com/products/images/beauty/Red%20Lipstick/1.png"] },
  { title: "Red Nail Polish", description: "The Red Nail Polish offers a rich and glossy red hue for vibrant and polished nails. With a quick-drying formula, it provides a salon-quality finish at home.", category: "beauty", price: 8.99, discountPercentage: 11.44, brand: "Nail Couture", stock: 79, images: ["https://cdn.dummyjson.com/products/images/beauty/Red%20Nail%20Polish/1.png"] },
  { title: "Calvin Klein CK One", description: "CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent. It's a versatile fragrance suitable for everyday wear.", category: "fragrances", price: 49.99, discountPercentage: 1.89, brand: "Calvin Klein", stock: 29, images: ["https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/1.png"] },
  { title: "Chanel Coco Noir Eau De", description: "Coco Noir by Chanel is an elegant and mysterious fragrance, featuring notes of grapefruit, rose, and sandalwood. Perfect for evening occasions.", category: "fragrances", price: 129.99, discountPercentage: 16.51, brand: "Chanel", stock: 71, images: ["https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/1.png"] },
  { title: "Dior J'adore", description: "J'adore by Dior is a luxurious and floral fragrance, known for its blend of ylang-ylang, rose, and jasmine. It embodies femininity and sophistication.", category: "fragrances", price: 89.99, discountPercentage: 14.72, brand: "Dior", stock: 98, images: ["https://cdn.dummyjson.com/products/images/fragrances/Dior%20J'adore/1.png"] },
  { title: "Dolce Shine Eau de", description: "Dolce Shine by Dolce & Gabbana is a vibrant and fruity fragrance, featuring notes of mango, jasmine, and blonde woods. It's a joyful and youthful scent.", category: "fragrances", price: 69.99, discountPercentage: 0.62, brand: "Dolce & Gabbana", stock: 4, images: ["https://cdn.dummyjson.com/products/images/fragrances/Dolce%20Shine%20Eau%20de/1.png"] },
  { title: "Gucci Bloom Eau de", description: "Gucci Bloom by Gucci is a floral and captivating fragrance, with notes of tuberose, jasmine, and Rangoon creeper. It's a modern and romantic scent.", category: "fragrances", price: 79.99, discountPercentage: 14.39, brand: "Gucci", stock: 91, images: ["https://cdn.dummyjson.com/products/images/fragrances/Gucci%20Bloom%20Eau%20de/1.png"] },
  { title: "Annibale Colombo Bed", description: "The Annibale Colombo Bed is a luxurious and elegant bed frame, crafted with high-quality materials for a comfortable and stylish bedroom.", category: "furniture", price: 1899.99, discountPercentage: 8.57, brand: "Annibale Colombo", stock: 88, images: ["https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/1.png"] },
  { title: "Annibale Colombo Sofa", description: "The Annibale Colombo Sofa is a sophisticated and comfortable seating option, featuring impeccable craftsmanship and high-quality materials for a luxurious living space.", category: "furniture", price: 2499.99, discountPercentage: 14.4, brand: "Annibale Colombo", stock: 60, images: ["https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Sofa/1.png"] },
  { title: "Bedside Table African Cherry", description: "The Bedside Table in African Cherry is a stylish and functional addition to your bedroom, providing convenient storage space and a touch of elegance.", category: "furniture", price: 299.99, discountPercentage: 19.09, brand: "Furniture Co.", stock: 64, images: ["https://cdn.dummyjson.com/products/images/furniture/Bedside%20Table%20African%20Cherry/1.png"] },
  { title: "Knives Tool Set Kitchen", description: "A versatile and essential tool set for your kitchen. Includes multiple knives for various cutting tasks.", category: "kitchen-accessories", price: 49.99, discountPercentage: 16.37, brand: "Chef Master", stock: 51, images: ["https://cdn.dummyjson.com/products/images/kitchen-accessories/Knives%20Tool%20Set%20Kitchen/1.png"] },
  { title: "Apple MacBook Pro 14 Inch Space Grey", description: "The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple's advanced M3 chip, a stunning Liquid Retina XDR display, and all-day battery life.", category: "laptops", price: 1999.99, discountPercentage: 8.4, brand: "Apple", stock: 6, images: ["https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/1.png"] },
  { title: "Asus Zenbook Pro Dual Screen Laptop", description: "The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.", category: "laptops", price: 1799.99, discountPercentage: 9.01, brand: "Asus", stock: 69, images: ["https://cdn.dummyjson.com/products/images/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/1.png"] },
  { title: "Huawei Matebook X Pro", description: "The Huawei Matebook X Pro is a slim and stylish laptop with a high-resolution touchscreen display, offering a premium experience for users on the go.", category: "laptops", price: 1399.99, discountPercentage: 12.25, brand: "Huawei", stock: 62, images: ["https://cdn.dummyjson.com/products/images/laptops/Huawei%20Matebook%20X%20Pro/1.png"] },
  { title: "Lenovo Yoga 920", description: "The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge and a high-resolution touchscreen, offering versatility for work and play.", category: "laptops", price: 1099.99, discountPercentage: 15.72, brand: "Lenovo", stock: 40, images: ["https://cdn.dummyjson.com/products/images/laptops/Lenovo%20Yoga%20920/1.png"] },
  { title: "New DELL XPS 13 9300 Laptop", description: "The New DELL XPS 13 9300 Laptop is a compact and powerful device, featuring a virtually borderless InfinityEdge display and a comfortable keyboard.", category: "laptops", price: 1499.99, discountPercentage: 3.89, brand: "Dell", stock: 30, images: ["https://cdn.dummyjson.com/products/images/laptops/New%20DELL%20XPS%2013%209300%20Laptop/1.png"] },
  { title: "iPhone 5s", description: "The iPhone 5s is a classic Apple smartphone with a compact design, Touch ID, and a reliable performance for everyday use.", category: "smartphones", price: 199.99, discountPercentage: 7.55, brand: "Apple", stock: 62, images: ["https://cdn.dummyjson.com/products/images/smartphones/iPhone%205s/1.png"] },
  { title: "iPhone 6", description: "The iPhone 6 is a sleek and stylish smartphone with a larger display and improved performance compared to its predecessor.", category: "smartphones", price: 299.99, discountPercentage: 12.5, brand: "Apple", stock: 25, images: ["https://cdn.dummyjson.com/products/images/smartphones/iPhone%206/1.png"] },
  { title: "iPhone 13 Pro", description: "The iPhone 13 Pro is a premium Apple smartphone with a ProMotion display, advanced camera system, and A15 Bionic chip.", category: "smartphones", price: 1099.99, discountPercentage: 8.02, brand: "Apple", stock: 68, images: ["https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/1.png"] },
  { title: "iPhone X", description: "The iPhone X is a revolutionary Apple smartphone with a Super Retina display, Face ID, and wireless charging.", category: "smartphones", price: 899.99, discountPercentage: 15.15, brand: "Apple", stock: 41, images: ["https://cdn.dummyjson.com/products/images/smartphones/iPhone%20X/1.png"] },
  { title: "Oppo A57", description: "The Oppo A57 is a budget-friendly Android smartphone with a large display and a capable camera system.", category: "smartphones", price: 249.99, discountPercentage: 12.24, brand: "Oppo", stock: 79, images: ["https://cdn.dummyjson.com/products/images/smartphones/Oppo%20A57/1.png"] },
  { title: "Oppo F19 Pro Plus", description: "The Oppo F19 Pro Plus is a mid-range Android smartphone with a vibrant AMOLED display and fast charging.", category: "smartphones", price: 399.99, discountPercentage: 10.32, brand: "Oppo", stock: 88, images: ["https://cdn.dummyjson.com/products/images/smartphones/Oppo%20F19%20Pro%20Plus/1.png"] },
  { title: "Oppo K1", description: "The Oppo K1 is a stylish Android smartphone with an in-display fingerprint sensor and a sleek design.", category: "smartphones", price: 299.99, discountPercentage: 6.44, brand: "Oppo", stock: 22, images: ["https://cdn.dummyjson.com/products/images/smartphones/Oppo%20K1/1.png"] },
  { title: "Realme C35", description: "The Realme C35 is a budget smartphone with a large display and long battery life, ideal for everyday use.", category: "smartphones", price: 149.99, discountPercentage: 14.36, brand: "Realme", stock: 87, images: ["https://cdn.dummyjson.com/products/images/smartphones/Realme%20C35/1.png"] },
  { title: "Realme X", description: "The Realme X is a mid-range smartphone with a pop-up selfie camera and a bezel-less AMOLED display.", category: "smartphones", price: 299.99, discountPercentage: 10.83, brand: "Realme", stock: 41, images: ["https://cdn.dummyjson.com/products/images/smartphones/Realme%20X/1.png"] },
  { title: "Redmi 10C", description: "The Redmi 10C is a budget smartphone with a large display and a capable camera, offering good value for money.", category: "smartphones", price: 129.99, discountPercentage: 7.29, brand: "Xiaomi", stock: 71, images: ["https://cdn.dummyjson.com/products/images/smartphones/Redmi%2010C/1.png"] },
  { title: "Samsung Galaxy S8", description: "The Samsung Galaxy S8 is a flagship Android smartphone with a curved Infinity Display and powerful performance.", category: "smartphones", price: 499.99, discountPercentage: 5.93, brand: "Samsung", stock: 74, images: ["https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S8/1.png"] },
  { title: "Samsung Galaxy S10", description: "The Samsung Galaxy S10 is a premium Android smartphone with a Dynamic AMOLED display and triple-camera system.", category: "smartphones", price: 699.99, discountPercentage: 8.79, brand: "Samsung", stock: 40, images: ["https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/1.png"] },
  { title: "Vivo S1", description: "The Vivo S1 is a mid-range Android smartphone with a sleek design and a capable camera system.", category: "smartphones", price: 249.99, discountPercentage: 6.92, brand: "Vivo", stock: 67, images: ["https://cdn.dummyjson.com/products/images/smartphones/Vivo%20S1/1.png"] },
  { title: "Vivo V9", description: "The Vivo V9 is a stylish Android smartphone with a full-screen display and a powerful selfie camera.", category: "smartphones", price: 299.99, discountPercentage: 7.44, brand: "Vivo", stock: 26, images: ["https://cdn.dummyjson.com/products/images/smartphones/Vivo%20V9/1.png"] },
  { title: "Vivo X21", description: "The Vivo X21 is a mid-range Android smartphone with an in-display fingerprint sensor and a sleek design.", category: "smartphones", price: 499.99, discountPercentage: 6.75, brand: "Vivo", stock: 4, images: ["https://cdn.dummyjson.com/products/images/smartphones/Vivo%20X21/1.png"] },
  { title: "Amazon Echo Plus", description: "The Amazon Echo Plus is a smart speaker with a built-in hub, offering premium sound and voice control.", category: "tablets", price: 99.99, discountPercentage: 10.89, brand: "Amazon", stock: 61, images: ["https://cdn.dummyjson.com/products/images/tablets/Amazon%20Echo%20Plus/1.png"] },
  { title: "Apple iPad Mini 5", description: "The Apple iPad Mini 5 is a compact and powerful tablet with a 7.9-inch Retina display and A12 Bionic chip.", category: "tablets", price: 399.99, discountPercentage: 9.16, brand: "Apple", stock: 47, images: ["https://cdn.dummyjson.com/products/images/tablets/Apple%20iPad%20Mini%205/1.png"] },
  { title: "iPad Mini 2021 Starlight", description: "The iPad Mini 2021 Starlight is a compact and powerful tablet with a 8.3-inch Liquid Retina display and A15 Bionic chip.", category: "tablets", price: 499.99, discountPercentage: 12.87, brand: "Apple", stock: 60, images: ["https://cdn.dummyjson.com/products/images/tablets/iPad%20Mini%202021%20Starlight/1.png"] },
  { title: "Samsung Galaxy Tab S8 Plus", description: "The Samsung Galaxy Tab S8 Plus is a premium Android tablet with a 12.4-inch AMOLED display and S Pen support.", category: "tablets", price: 899.99, discountPercentage: 8.02, brand: "Samsung", stock: 74, images: ["https://cdn.dummyjson.com/products/images/tablets/Samsung%20Galaxy%20Tab%20S8%20Plus/1.png"] },
  { title: "Samsung Galaxy Tab White", description: "The Samsung Galaxy Tab in White is a versatile Android tablet with a 10.4-inch display and long battery life.", category: "tablets", price: 349.99, discountPercentage: 6.32, brand: "Samsung", stock: 25, images: ["https://cdn.dummyjson.com/products/images/tablets/Samsung%20Galaxy%20Tab%20White/1.png"] },
  { title: "Rolex Submariner Watch", description: "The Rolex Submariner is a legendary dive watch with a timeless design and exceptional craftsmanship.", category: "mens-watches", price: 13999.99, discountPercentage: 9.61, brand: "Rolex", stock: 32, images: ["https://cdn.dummyjson.com/products/images/mens-watches/Rolex%20Submariner%20Watch/1.png"] },
  { title: "Brown Leather Belt Watch", description: "A stylish brown leather belt watch with a classic design, perfect for everyday wear.", category: "mens-watches", price: 89.99, discountPercentage: 8.01, brand: "Fashion Timepieces", stock: 86, images: ["https://cdn.dummyjson.com/products/images/mens-watches/Brown%20Leather%20Belt%20Watch/1.png"] },
  { title: "Longines Master Collection", description: "The Longines Master Collection is a sophisticated Swiss watch with an elegant design and automatic movement.", category: "mens-watches", price: 1499.99, discountPercentage: 6.71, brand: "Longines", stock: 89, images: ["https://cdn.dummyjson.com/products/images/mens-watches/Longines%20Master%20Collection/1.png"] },
  { title: "Rolex Datejust", description: "The Rolex Datejust is a classic luxury watch with a timeless design and a signature cyclops lens over the date.", category: "mens-watches", price: 10999.99, discountPercentage: 8.79, brand: "Rolex", stock: 61, images: ["https://cdn.dummyjson.com/products/images/mens-watches/Rolex%20Datejust/1.png"] },
  { title: "Rolex Cellini Date Black Dial", description: "The Rolex Cellini Date in Black Dial is an elegant dress watch with a refined design and precious materials.", category: "mens-watches", price: 8999.99, discountPercentage: 7.85, brand: "Rolex", stock: 48, images: ["https://cdn.dummyjson.com/products/images/mens-watches/Rolex%20Cellini%20Date%20Black%20Dial/1.png"] },
  { title: "Apple Watch Series 4", description: "The Apple Watch Series 4 is a smartwatch with a larger display and advanced health monitoring features.", category: "womens-watches", price: 399.99, discountPercentage: 8.56, brand: "Apple", stock: 73, images: ["https://cdn.dummyjson.com/products/images/womens-watches/Apple%20Watch%20Series%204/1.png"] },
  { title: "Brown Leather Belt Watch Women", description: "A stylish brown leather belt watch for women with a classic design and elegant look.", category: "womens-watches", price: 79.99, discountPercentage: 9.71, brand: "Fashion Timepieces", stock: 78, images: ["https://cdn.dummyjson.com/products/images/womens-watches/Brown%20Leather%20Belt%20Watch/1.png"] },
  { title: "IWC Ingenieur Automatic Steel", description: "The IWC Ingenieur Automatic Steel is a robust and elegant luxury watch with a distinctive design.", category: "womens-watches", price: 8999.99, discountPercentage: 5.56, brand: "IWC", stock: 92, images: ["https://cdn.dummyjson.com/products/images/womens-watches/IWC%20Ingenieur%20Automatic%20Steel/1.png"] },
  { title: "Rolex Cellini Moonphase", description: "The Rolex Cellini Moonphase is an elegant dress watch with a moonphase complication and precious materials.", category: "womens-watches", price: 15999.99, discountPercentage: 7.5, brand: "Rolex", stock: 4, images: ["https://cdn.dummyjson.com/products/images/womens-watches/Rolex%20Cellini%20Moonphase/1.png"] },
  { title: "Rolex Datejust Women", description: "The Rolex Datejust for women is a classic luxury watch with a smaller case and elegant design.", category: "womens-watches", price: 9999.99, discountPercentage: 9.11, brand: "Rolex", stock: 41, images: ["https://cdn.dummyjson.com/products/images/womens-watches/Rolex%20Datejust%20Women/1.png"] },
  { title: "Watch Gold for Women", description: "A stylish gold watch for women with a refined design and elegant look.", category: "womens-watches", price: 799.99, discountPercentage: 8.86, brand: "Fashion Timepieces", stock: 50, images: ["https://cdn.dummyjson.com/products/images/womens-watches/Watch%20Gold%20for%20Women/1.png"] },
  { title: "Women's Wrist Watch", description: "A classic women's wrist watch with a stylish design and reliable performance.", category: "womens-watches", price: 129.99, discountPercentage: 9.92, brand: "Fashion Timepieces", stock: 94, images: ["https://cdn.dummyjson.com/products/images/womens-watches/Women's%20Wrist%20Watch/1.png"] },
  { title: "BMW M4", description: "A detailed die-cast model of the BMW M4 sports car for collectors.", category: "vehicle", price: 24.99, discountPercentage: 15.66, brand: "BMW", stock: 51, images: ["https://cdn.dummyjson.com/products/images/vehicle/BMW%20M4/1.png"] },
  { title: "Dodge Hornet GT Plus", description: "A detailed die-cast model of the Dodge Hornet GT Plus SUV for collectors.", category: "vehicle", price: 34.99, discountPercentage: 8.79, brand: "Dodge", stock: 83, images: ["https://cdn.dummyjson.com/products/images/vehicle/Dodge%20Hornet%20GT%20Plus/1.png"] },
  { title: "Dodge Viper SRT", description: "A detailed die-cast model of the Dodge Viper SRT sports car for collectors.", category: "vehicle", price: 29.99, discountPercentage: 10.85, brand: "Dodge", stock: 92, images: ["https://cdn.dummyjson.com/products/images/vehicle/Dodge%20Viper%20SRT/1.png"] },
  { title: "Charger SXT RWD", description: "A detailed die-cast model of the Dodge Charger SXT RWD sedan for collectors.", category: "vehicle", price: 39.99, discountPercentage: 12.5, brand: "Dodge", stock: 39, images: ["https://cdn.dummyjson.com/products/images/vehicle/Charger%20SXT%20RWD/1.png"] },
  { title: "Jeep Wrangler", description: "A detailed die-cast model of the Jeep Wrangler off-road SUV for collectors.", category: "vehicle", price: 44.99, discountPercentage: 13.51, brand: "Jeep", stock: 22, images: ["https://cdn.dummyjson.com/products/images/vehicle/Jeep%20Wrangler/1.png"] },
  { title: "Amazon Kindle Paperwhite", description: "The Amazon Kindle Paperwhite is a waterproof e-reader with a high-resolution display and weeks of battery life.", category: "mobile-accessories", price: 149.99, discountPercentage: 8.02, brand: "Amazon", stock: 100, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Amazon%20Kindle%20Paperwhite/1.png"] },
  { title: "Apple AirPods Max Silver", description: "The Apple AirPods Max in Silver are premium over-ear headphones with active noise cancellation and spatial audio.", category: "mobile-accessories", price: 549.99, discountPercentage: 9.09, brand: "Apple", stock: 68, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20AirPods%20Max%20Silver/1.png"] },
  { title: "Apple Airpower Wireless Charger", description: "The Apple AirPower Wireless Charger is a mat that charges multiple Apple devices simultaneously.", category: "mobile-accessories", price: 79.99, discountPercentage: 6.88, brand: "Apple", stock: 90, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20Airpower%20Wireless%20Charger/1.png"] },
  { title: "Apple iPhone Charger", description: "The Apple iPhone Charger is a fast and reliable charging solution for your iPhone.", category: "mobile-accessories", price: 19.99, discountPercentage: 15.42, brand: "Apple", stock: 92, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20iPhone%20Charger/1.png"] },
  { title: "Apple MagSafe Battery Pack", description: "The Apple MagSafe Battery Pack is a portable battery that magnetically attaches to iPhone for convenient charging.", category: "mobile-accessories", price: 99.99, discountPercentage: 6.68, brand: "Apple", stock: 64, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20MagSafe%20Battery%20Pack/1.png"] },
  { title: "Apple Watch Series 4 (Mobile)", description: "The Apple Watch Series 4 is a smartwatch with a larger display and advanced health monitoring features.", category: "mobile-accessories", price: 129.99, discountPercentage: 10.85, brand: "Apple", stock: 47, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20Watch%20Series%204/1.png"] },
  { title: "Beats Flex Wireless Earphones", description: "The Beats Flex are wireless earphones with a tangle-free design and long battery life.", category: "mobile-accessories", price: 49.99, discountPercentage: 6.88, brand: "Beats", stock: 51, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Beats%20Flex%20Wireless%20Earphones/1.png"] },
  { title: "iPhone 12 Silicone Case with MagSafe", description: "The iPhone 12 Silicone Case with MagSafe is a soft-touch case that snaps magnetically to the phone.", category: "mobile-accessories", price: 49.99, discountPercentage: 6.97, brand: "Apple", stock: 29, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/iPhone%2012%20Silicone%20Case%20with%20MagSafe%20Plum/1.png"] },
  { title: "Monopod", description: "A versatile monopod for stable photography and video recording on the go.", category: "mobile-accessories", price: 19.99, discountPercentage: 12.43, brand: "Photography Pro", stock: 100, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Monopod/1.png"] },
  { title: "Selfie Lamp with iPhone", description: "A selfie lamp with an iPhone holder for better lighting in photos and videos.", category: "mobile-accessories", price: 14.99, discountPercentage: 10.85, brand: "Photography Pro", stock: 43, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Selfie%20Lamp%20with%20iPhone/1.png"] },
  { title: "Selfie Stick Monopod", description: "A selfie stick monopod for capturing group photos and selfies with ease.", category: "mobile-accessories", price: 12.99, discountPercentage: 8.02, brand: "Photography Pro", stock: 30, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/Selfie%20Stick%20Monopod/1.png"] },
  { title: "TV Studio Camera Pedestal", description: "A sturdy TV studio camera pedestal for professional broadcasting and film production.", category: "mobile-accessories", price: 499.99, discountPercentage: 6.88, brand: "Broadcast Pro", stock: 48, images: ["https://cdn.dummyjson.com/products/images/mobile-accessories/TV%20Studio%20Camera%20Pedestal/1.png"] },
  { title: "Cat Food Premium", description: "A premium cat food formula for adult cats with high-quality ingredients.", category: "groceries", price: 12.99, discountPercentage: 8.02, brand: "Whiskas", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Cat%20Food/1.png"] },
  { title: "Apple Juice", description: "Fresh and natural apple juice with no added sugar.", category: "groceries", price: 3.99, discountPercentage: 6.44, brand: "Minute Maid", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Apple%20Juice/1.png"] },
  { title: "Beef Steak", description: "Premium quality beef steak, perfect for grilling or pan-frying.", category: "groceries", price: 24.99, discountPercentage: 10.85, brand: "Butcher's Choice", stock: 47, images: ["https://cdn.dummyjson.com/products/images/groceries/Beef%20Steak/1.png"] },
  { title: "Chicken Meat", description: "Fresh chicken meat, ideal for a variety of dishes from curries to roasts.", category: "groceries", price: 9.99, discountPercentage: 6.88, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Chicken%20Meat/1.png"] },
  { title: "Cooking Oil", description: "A versatile cooking oil suitable for frying, sautéing, and baking.", category: "groceries", price: 4.99, discountPercentage: 5.79, brand: "Sunflower", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Cooking%20Oil/1.png"] },
  { title: "Cucumber", description: "Fresh cucumbers, perfect for salads and garnishes.", category: "groceries", price: 1.49, discountPercentage: 6.02, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Cucumber/1.png"] },
  { title: "Dog Food", description: "Nutritious dog food for adult dogs with high-quality ingredients.", category: "groceries", price: 14.99, discountPercentage: 12.16, brand: "Pedigree", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Dog%20Food/1.png"] },
  { title: "Eggs", description: "Farm-fresh eggs, ideal for cooking and baking.", category: "groceries", price: 2.99, discountPercentage: 5.79, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Eggs/1.png"] },
  { title: "Fish Steak", description: "Premium fish steak, perfect for grilling or pan-searing.", category: "groceries", price: 12.99, discountPercentage: 6.88, brand: "Ocean Fresh", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Fish%20Steak/1.png"] },
  { title: "Green Bell Pepper", description: "Fresh green bell peppers, perfect for stir-fries and salads.", category: "groceries", price: 1.99, discountPercentage: 5.79, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Green%20Bell%20Pepper/1.png"] },
  { title: "Green Chili Pepper", description: "Fresh green chili peppers for adding heat to your dishes.", category: "groceries", price: 1.49, discountPercentage: 6.02, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Green%20Chili%20Pepper/1.png"] },
  { title: "Honey Jar", description: "Pure natural honey in a convenient jar.", category: "groceries", price: 7.99, discountPercentage: 5.79, brand: "Nature's Best", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Honey%20Jar/1.png"] },
  { title: "Ice Cream", description: "Creamy vanilla ice cream made with real vanilla beans.", category: "groceries", price: 5.49, discountPercentage: 6.02, brand: "Frosty Delights", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Ice%20Cream/1.png"] },
  { title: "Juice", description: "Refreshing mixed fruit juice with no added preservatives.", category: "groceries", price: 3.99, discountPercentage: 5.79, brand: "Minute Maid", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Juice/1.png"] },
  { title: "Kiwi", description: "Fresh kiwi fruit, packed with vitamins and antioxidants.", category: "groceries", price: 2.49, discountPercentage: 6.02, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Kiwi/1.png"] },
  { title: "Lemon", description: "Fresh lemons, ideal for drinks, dressings, and desserts.", category: "groceries", price: 1.29, discountPercentage: 5.79, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Lemon/1.png"] },
  { title: "Milk", description: "Fresh whole milk, rich in calcium and protein.", category: "groceries", price: 2.99, discountPercentage: 6.02, brand: "Dairy Fresh", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Milk/1.png"] },
  { title: "Mulberry", description: "Fresh mulberries, sweet and juicy.", category: "groceries", price: 4.99, discountPercentage: 5.79, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Mulberry/1.png"] },
  { title: "Nescafe Coffee", description: "Instant coffee for a quick and easy coffee fix.", category: "groceries", price: 8.99, discountPercentage: 6.02, brand: "Nescafe", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Nescafe%20Coffee/1.png"] },
  { title: "Potatoes", description: "Fresh potatoes, a versatile staple for many dishes.", category: "groceries", price: 2.49, discountPercentage: 5.79, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Potatoes/1.png"] },
  { title: "Protein Powder", description: "Whey protein powder for muscle recovery and growth.", category: "groceries", price: 29.99, discountPercentage: 6.88, brand: "MuscleTech", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Protein%20Powder/1.png"] },
  { title: "Red Onions", description: "Fresh red onions for cooking and salads.", category: "groceries", price: 1.99, discountPercentage: 5.79, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Red%20Onions/1.png"] },
  { title: "Rice", description: "Long-grain white rice, ideal for a variety of dishes.", category: "groceries", price: 5.99, discountPercentage: 6.02, brand: "Golden Grain", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Rice/1.png"] },
  { title: "Soft Drinks", description: "Carbonated soft drinks, refreshing and fizzy.", category: "groceries", price: 1.99, discountPercentage: 5.79, brand: "Coca-Cola", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Soft%20Drinks/1.png"] },
  { title: "Strawberry", description: "Fresh strawberries, sweet and juicy.", category: "groceries", price: 3.49, discountPercentage: 6.02, brand: "Fresh Farms", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Strawberry/1.png"] },
  { title: "Tissue Paper Box", description: "Soft tissue paper in a convenient box.", category: "groceries", price: 2.99, discountPercentage: 5.79, brand: "SoftCare", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Tissue%20Paper%20Box/1.png"] },
  { title: "Water", description: "Pure drinking water, safe and refreshing.", category: "groceries", price: 0.99, discountPercentage: 6.02, brand: "Aquafina", stock: 100, images: ["https://cdn.dummyjson.com/products/images/groceries/Water/1.png"] },
  { title: "Blue Eyeshadow Palette", description: "A blue-themed eyeshadow palette for bold looks.", category: "beauty", price: 12.99, discountPercentage: 8.02, brand: "Glamour Beauty", stock: 60, images: ["https://cdn.dummyjson.com/products/images/beauty/Blue%20Eyeshadow%20Palette/1.png"] },
  { title: "Blush Brush", description: "A soft brush for applying blush with precision.", category: "beauty", price: 8.99, discountPercentage: 6.88, brand: "Glamour Beauty", stock: 80, images: ["https://cdn.dummyjson.com/products/images/beauty/Blush%20Brush/1.png"] },
  { title: "Bronze Lip Balm", description: "A tinted lip balm in bronze shade for everyday wear.", category: "beauty", price: 6.99, discountPercentage: 5.79, brand: "Chic Cosmetics", stock: 90, images: ["https://cdn.dummyjson.com/products/images/beauty/Bronze%20Lip%20Balm/1.png"] },
  { title: "Chocolate Lip Gloss", description: "A chocolate-flavored lip gloss with a glossy finish.", category: "beauty", price: 7.99, discountPercentage: 6.02, brand: "Chic Cosmetics", stock: 85, images: ["https://cdn.dummyjson.com/products/images/beauty/Chocolate%20Lip%20Gloss/1.png"] },
  { title: "Compact Powder", description: "A compact powder for a flawless matte finish.", category: "beauty", price: 11.99, discountPercentage: 5.79, brand: "Velvet Touch", stock: 75, images: ["https://cdn.dummyjson.com/products/images/beauty/Compact%20Powder/1.png"] },
  { title: "Concealer Stick", description: "A creamy concealer stick for covering blemishes and dark circles.", category: "beauty", price: 9.99, discountPercentage: 6.88, brand: "Velvet Touch", stock: 70, images: ["https://cdn.dummyjson.com/products/images/beauty/Concealer%20Stick/1.png"] },
  { title: "Eyelash Curler", description: "A stainless steel eyelash curler for a wide-awake look.", category: "beauty", price: 5.99, discountPercentage: 5.79, brand: "Glamour Beauty", stock: 95, images: ["https://cdn.dummyjson.com/products/images/beauty/Eyelash%20Curler/1.png"] },
  { title: "Gucci Bloom Eau de (Beauty)", description: "A floral fragrance from Gucci with notes of tuberose and jasmine.", category: "beauty", price: 79.99, discountPercentage: 5.79, brand: "Gucci", stock: 40, images: ["https://cdn.dummyjson.com/products/images/beauty/Gucci%20Bloom%20Eau%20de/1.png"] },
  { title: "Facial Cleanser", description: "A gentle facial cleanser for daily use.", category: "skin-care", price: 12.99, discountPercentage: 6.88, brand: "Clean & Clear", stock: 65, images: ["https://cdn.dummyjson.com/products/images/skin-care/Facial%20Cleanser/1.png"] },
  { title: "Moisturizer", description: "A nourishing face moisturizer for dry skin.", category: "skin-care", price: 15.99, discountPercentage: 5.79, brand: "Nivea", stock: 55, images: ["https://cdn.dummyjson.com/products/images/skin-care/Moisturizer/1.png"] },
  { title: "Sunscreen", description: "A lightweight sunscreen with SPF 50 for daily protection.", category: "skin-care", price: 14.99, discountPercentage: 6.02, brand: "Neutrogena", stock: 45, images: ["https://cdn.dummyjson.com/products/images/skin-care/Sunscreen/1.png"] },
  { title: "Face Mask", description: "A hydrating face mask for a spa-like experience at home.", category: "skin-care", price: 9.99, discountPercentage: 5.79, brand: "Garnier", stock: 80, images: ["https://cdn.dummyjson.com/products/images/skin-care/Face%20Mask/1.png"] },
  { title: "Sheet Mask Set", description: "A set of sheet masks with various natural extracts.", category: "skin-care", price: 11.99, discountPercentage: 6.88, brand: "Garnier", stock: 60, images: ["https://cdn.dummyjson.com/products/images/skin-care/Sheet%20Mask%20Set/1.png"] },
  { title: "Toning Lotion", description: "A refreshing toning lotion to balance skin after cleansing.", category: "skin-care", price: 13.99, discountPercentage: 5.79, brand: "Rose Water", stock: 50, images: ["https://cdn.dummyjson.com/products/images/skin-care/Toning%20Lotion/1.png"] },
  { title: "Serum", description: "A vitamin C serum for brightening and anti-aging.", category: "skin-care", price: 24.99, discountPercentage: 6.02, brand: "L'Oreal", stock: 42, images: ["https://cdn.dummyjson.com/products/images/skin-care/Serum/1.png"] },
  { title: "Eye Cream", description: "An under-eye cream for reducing dark circles and puffiness.", category: "skin-care", price: 18.99, discountPercentage: 5.79, brand: "L'Oreal", stock: 48, images: ["https://cdn.dummyjson.com/products/images/skin-care/Eye%20Cream/1.png"] },
  { title: "Lip Balm", description: "A moisturizing lip balm with shea butter.", category: "skin-care", price: 4.99, discountPercentage: 6.88, brand: "Nivea", stock: 90, images: ["https://cdn.dummyjson.com/products/images/skin-care/Lip%20Balm/1.png"] }
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const slugToName = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const pickImage = (arr) => (Array.isArray(arr) ? arr.slice(0, 5) : []);

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Build unique category list from products
    const categorySlugs = [...new Set(RAW.map((p) => p.category))];
    console.log(`📦 Found ${categorySlugs.length} categories`);

    // 2. Upsert categories, keep a slug → ObjectId map
    const slugToId = {};
    for (const slug of categorySlugs) {
      const name = slugToName(slug);
      const cat = await Category.findOneAndUpdate(
        { name },
        {
          $setOnInsert: {
            name,
            description: `${name} products`,
            image: "",
            status: "active",
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      slugToId[slug] = cat._id;
      console.log(`  • Category: ${name}  (${cat._id})`);
    }

    // 3. Insert products
    let inserted = 0;
    let skipped = 0;

    for (const p of RAW) {
      const exists = await Product.findOne({ name: p.title });
      if (exists) {
        skipped++;
        continue;
      }

      await Product.create({
        name: p.title,
        description: p.description,
        price: p.price,
        discount: Math.round(p.discountPercentage || 0),
        categoryId: slugToId[p.category],
        brand: p.brand || "",
        stock: Math.round(p.stock || 0),
        images: pickImage(p.images),
        status: "active",
      });
      inserted++;
    }

    console.log(`✅ Inserted ${inserted} products`);
    if (skipped) console.log(`ℹ️  Skipped ${skipped} existing products`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

run();