# Seed Data Strategy

## Overview

The seed data generation strategy has been designed to create realistic, time-distributed data that provides meaningful statistics for weekly and monthly trend analysis in the dashboard.

## Key Design Principles

### 1. Time Distribution

Orders and related data are distributed across a 6-month historical period to enable:
- Weekly trend analysis
- Monthly growth patterns
- Seasonal variations
- Historical performance tracking

**Distribution Strategy:**
- **Last 2 months (50%)**: Recent activity showing current trends
- **Months 2-4 (30%)**: Medium-term historical data
- **Months 4-6 (20%)**: Long-term historical baseline

### 2. Data Coherence

All generated data maintains logical consistency:

#### Order Status Progression
- **Orders > 30 days old**: 75% delivered, 15% cancelled, 10% shipped
- **Orders 15-30 days old**: 50% delivered, 30% shipped, 10% confirmed, 10% cancelled
- **Orders 7-15 days old**: 40% shipped, 30% confirmed, 15% delivered, 10% pending, 5% cancelled
- **Orders < 7 days old**: 40% pending, 35% confirmed, 15% shipped, 5% delivered, 5% cancelled

#### Payment Status Alignment
- **PENDING orders**: 30% paid, 70% pending
- **CONFIRMED orders**: 80% paid, 20% pending
- **SHIPPED/DELIVERED orders**: 100% paid
- **CANCELLED orders**: 50% failed, 50% refunded

### 3. Entity Relationships

#### Coupons
- Time-distributed validity periods
- Usage counts proportional to active duration
- Applied only when valid during order date
- 25% of orders use coupons

#### Promotions
Multiple promotion types for comprehensive testing:
- **ORDER scope**: Percentage and fixed amount discounts
- **CATEGORY scope**: Category-specific promotions
- **PRODUCT scope**: BOGO, Buy X Get Y, Buy X Pay Y
- 15% of orders use promotions
- Applied only when valid during order date

#### Payments
- Created only for PAID or FAILED orders
- Transaction IDs follow format: `TXN-{orderNumber}-{randomHash}`
- Payment timestamps within 1-3 days of order date
- Failure timestamps within 24 hours of order date
- Gateway responses include realistic JSON data

#### Stock Transactions
- **IN transactions**: Initial stock for all products
- **OUT transactions**: Created for ~30% of order items
- **ADJUSTMENT transactions**: Random corrections (±10 units)
- Complete audit trail with before/after stock values

### 4. Realistic Patterns

#### Product Distribution
- 100 products across multiple categories
- 1-5 images per product
- 90% active, 10% inactive
- 15% featured products
- 0-4 tags per product

#### Order Patterns
- 400 orders distributed over 6 months
- 1-5 items per order
- Realistic price ranges (20,000 - 200,000 VND)
- 20% include order notes
- Varied payment methods

#### User Behavior
- 50 customer accounts + 1 admin
- 1-3 addresses per user
- 0-10 wishlist items per user
- Reviews only for delivered orders
- 40% of notifications read

## Seeding Sequence

The entities are seeded in the following order to maintain referential integrity:

1. **Users** - Required by all other entities
2. **Payment Methods** - Used by orders
3. **Categories** - Required by products
4. **Product Tags** - Applied to products
5. **Products** - Core entity for orders
6. **Coupons** - Optional discount for orders
7. **Promotions** - Optional promotional discount for orders
8. **User Addresses** - Shipping addresses for orders
9. **Orders** - Main transactional entity
10. **Payments** - Payment records for orders
11. **Stock Transactions** - Inventory movements
12. **Product Reviews** - User feedback
13. **Wishlists** - User preferences
14. **Notifications** - System messages

## Statistics Support

The seed data strategy ensures meaningful statistics:

### Revenue Analytics
- Daily revenue trends with realistic fluctuations
- Weekly revenue showing 6-month history
- Monthly revenue demonstrating growth patterns
- Average order value calculation

### Order Analytics
- Order status distribution
- Order completion rates
- Order processing time analysis
- Category sales breakdown

### Customer Analytics
- Customer growth over time
- Customer retention patterns
- Purchase frequency analysis
- Customer lifetime value estimation

### Inventory Analytics
- Stock level tracking
- Low stock product identification
- Stock turnover rates
- Inventory adjustment history

## URL and Redirect Strategy

### Notification URLs
All notification links use validated relative paths that work with frontend routing:

- **Order notifications**: `/orders/{orderId}` or `/orders`
- **Product notifications**: `/products/{productSlug}`
- **System notifications**: `/`, `/promotions`, `/about`, `/contact`, `/faq`

### URL Validation
- All URLs follow consistent format
- Slugs used for SEO-friendly product URLs
- IDs used for specific resource access
- Fallback to list pages when specific resource unavailable

## Best Practices for Future Modifications

### Adding New Entities
1. Add to `clearAllData()` in correct dependency order
2. Create seed method with comprehensive documentation
3. Call in `seedAll()` after dependencies
4. Ensure time distribution for time-series data
5. Maintain data coherence with related entities

### Adjusting Time Distribution
1. Modify `seedBaseDate` initialization (currently 6 months)
2. Update `generateWeightedOrderDate()` distribution percentages
3. Adjust order status determination thresholds
4. Update coupon/promotion validity periods accordingly

### Enhancing Data Realism
1. Add more varied product categories
2. Introduce seasonal patterns
3. Create user purchase patterns
4. Add product popularity variations
5. Implement realistic stock depletion

## Running the Seed

### Via API Endpoint
```bash
POST /api/seed/all
```

### Via SeedController
- Endpoint: `POST /api/seed/all`
- No authentication required
- Returns: Success message or error details

### Clear Existing Data
```bash
POST /api/seed/clear
```
⚠️ **Warning**: This will permanently delete all data. Use only in development.

## Troubleshooting

### Common Issues

1. **Foreign Key Violations**
   - Ensure `clearAllData()` deletes in correct order
   - Check seed methods called after dependencies

2. **Out of Memory**
   - Reduce batch sizes in loop iterations
   - Use `entityManager.flush()` more frequently
   - Consider pagination for large datasets

3. **Slow Performance**
   - Enable batch insert in hibernate properties
   - Use bulk operations where possible
   - Consider async seeding for large datasets

4. **Inconsistent Statistics**
   - Verify time distribution percentages
   - Check order status determination logic
   - Validate coupon/promotion date filtering

## Future Enhancements

Potential improvements for consideration:

1. **Configurable Parameters**
   - Make time ranges configurable
   - Allow custom distribution percentages
   - Support different data volumes

2. **Advanced Patterns**
   - Seasonal sales variations
   - Customer segment patterns
   - Product lifecycle simulation
   - Marketing campaign effects

3. **Performance Optimization**
   - Parallel seeding for independent entities
   - Bulk insert optimization
   - Progress tracking and resumption

4. **Data Quality**
   - Add data validation checks
   - Generate quality metrics
   - Provide seed summary report

## References

- **DataSeederService.java**: Main seed implementation
- **Dashboard Analytics**: `/api/admin/dashboard/*` endpoints
- **Database Schema**: See `03-database-schema.md`
- **Entity Relationships**: See `05-technical-architecture.md`
