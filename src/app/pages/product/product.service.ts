import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Product {
    id: number;
    name: string;
    sku: string;
    shopName: string;
    sellerId: string;
    inStock: number;
    sold: number;
    price: number;
    status: string;
    category: string;
    imageUrl: string;
}


@Injectable({ providedIn: 'root' })
export class ProductService {
    private products$ = new BehaviorSubject<Product[]>([]);

    constructor() {
        const products: Product[] = [];
        const categories = ['Electronics', 'Furniture', 'Home', 'Fashion'];

        for (let i = 1; i <= 80; i++) {
            const category = categories[i % categories.length];
            const imageUrl = this.getRandomImage(category);

            products.push({
                id: i,
                name: `Product ${i}`,
                sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                shopName: `Shop ${Math.ceil(Math.random() * 10)}`,
                sellerId: `SELLER-${Math.floor(100 + Math.random() * 900)}`,
                inStock: Math.floor(Math.random() * 200),
                sold: Math.floor(Math.random() * 50),
                price: Math.floor(Math.random() * 500) + 10,
                status: Math.random() > 0.5 ? 'active' : 'inactive',
                category,
                imageUrl
            });

        }

        this.products$.next(products);
    }

    getProducts(
        page: number,
        pageSize: number,
        search?: string,
        minStock?: number | null,
        maxStock?: number | null,
        minPrice?: number | null,
        maxPrice?: number | null,
        status?: 'active' | 'inactive' | null
    ): Observable<{ total: number; data: Product[] }> {
        return this.products$.asObservable().pipe(
            delay(500),
            map(products => {
                let filtered = products;

                if (search) {
                    const keyword = search.toLowerCase();
                    filtered = filtered.filter(p =>
                        p.name.toLowerCase().includes(keyword) || p.sku.toLowerCase().includes(keyword)
                    );
                }

                if (minStock) {
                    filtered = filtered.filter(p => p.inStock >= minStock);
                }
                if (maxStock) {
                    filtered = filtered.filter(p => p.inStock <= maxStock);
                }

                if (minPrice) {
                    filtered = filtered.filter(p => p.price >= minPrice);
                }
                if (maxPrice) {
                    filtered = filtered.filter(p => p.price <= maxPrice);
                }

                if (status) {
                    filtered = filtered.filter(p => p.status === status);
                }

                const total = filtered.length;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;

                return {
                    total,
                    data: filtered.slice(start, end)
                };
            })
        );
    }

    deleteProduct(id: number): Observable<{ success: boolean; total: number; data: Product[] }> {
        const currentProducts = this.products$.getValue();
        const updatedProducts = currentProducts.filter(p => p.id !== id);
        this.products$.next(updatedProducts);

        return of({
            success: true,
            total: updatedProducts.length,
            data: updatedProducts
        }).pipe(delay(300));
    }

    private categoryImages: Record<string, string[]> = {
        Electronics: [
            'assets/product-images/product1.webp',
            'assets/product-images/product2.webp',
        ],
        Furniture: [
            'assets/product-images/product3.webp',
            'assets/product-images/product4.jpg',
        ],
        Home: [
            'assets/product-images/product5.jpg',
            'assets/product-images/capy.jpg',
        ],
        Fashion: [
            'assets/product-images/product6.webp',
            'assets/product-images/product7.webp',
        ]
    };

    getRandomImage(category: string): string {
        const images = this.categoryImages[category] || [];
        if (!images.length) return 'assets/product-images/default.webp';
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }
}
