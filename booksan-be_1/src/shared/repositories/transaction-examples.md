# Transaction Examples with Base Repository

The base repository provides built-in transaction support through the `transaction()` method. Here are comprehensive examples of how to use it effectively.

## Basic Transaction Usage

### 1. Simple Transaction
```typescript
// In your service or use case
async createUserWithProfile(userData: CreateUserData, profileData: CreateProfileData) {
  return this.userRepository.transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: userData,
    });

    // Create profile linked to user
    const profile = await tx.profile.create({
      data: {
        ...profileData,
        userId: user.id,
      },
    });

    return { user, profile };
  });
}
```

### 2. Multi-Repository Transaction
```typescript
// In your service
async transferBooking(fromUserId: string, toUserId: string, bookingId: string) {
  return this.bookingRepository.transaction(async (tx) => {
    // Update booking owner
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: { userId: toUserId },
    });

    // Create transfer record
    const transfer = await tx.bookingTransfer.create({
      data: {
        bookingId,
        fromUserId,
        toUserId,
        transferredAt: new Date(),
      },
    });

    // Update user statistics
    await tx.user.update({
      where: { id: fromUserId },
      data: { bookingCount: { decrement: 1 } },
    });

    await tx.user.update({
      where: { id: toUserId },
      data: { bookingCount: { increment: 1 } },
    });

    return { booking, transfer };
  });
}
```

## Advanced Transaction Patterns

### 3. Conditional Transaction with Rollback
```typescript
async processPaymentWithBooking(paymentData: PaymentData, bookingData: BookingData) {
  return this.paymentRepository.transaction(async (tx) => {
    // Create payment
    const payment = await tx.payment.create({
      data: paymentData,
    });

    // Check if payment is successful
    if (payment.status !== 'COMPLETED') {
      throw new Error('Payment failed');
    }

    // Create booking only if payment succeeds
    const booking = await tx.booking.create({
      data: {
        ...bookingData,
        paymentId: payment.id,
        status: 'CONFIRMED',
      },
    });

    // Update venue availability
    await tx.venue.update({
      where: { id: bookingData.venueId },
      data: { availableSlots: { decrement: 1 } },
    });

    return { payment, booking };
  });
}
```

### 4. Batch Operations with Transaction
```typescript
async bulkUpdateUserRoles(userRoleUpdates: Array<{ userId: string; role: UserRole }>) {
  return this.userRepository.transaction(async (tx) => {
    const results = [];

    for (const update of userRoleUpdates) {
      const user = await tx.user.update({
        where: { id: update.userId },
        data: { role: update.role },
      });
      results.push(user);
    }

    // Log the bulk operation
    await tx.auditLog.create({
      data: {
        action: 'BULK_ROLE_UPDATE',
        details: { count: userRoleUpdates.length },
        performedBy: 'system',
      },
    });

    return results;
  });
}
```

### 5. Complex Business Logic with Multiple Models
```typescript
async createVenueWithFacilities(venueData: CreateVenueData, facilitiesData: CreateFacilityData[]) {
  return this.venueRepository.transaction(async (tx) => {
    // Create venue
    const venue = await tx.venue.create({
      data: venueData,
    });

    // Create facilities
    const facilities = await Promise.all(
      facilitiesData.map(facilityData =>
        tx.facility.create({
          data: {
            ...facilityData,
            venueId: venue.id,
          },
        })
      )
    );

    // Create default pricing
    const pricing = await tx.venuePricing.create({
      data: {
        venueId: venue.id,
        basePrice: venueData.basePrice,
        currency: 'USD',
      },
    });

    // Update owner's venue count
    await tx.user.update({
      where: { id: venueData.ownerId },
      data: { venueCount: { increment: 1 } },
    });

    return { venue, facilities, pricing };
  });
}
```

## Error Handling in Transactions

### 6. Transaction with Error Handling
```typescript
async processBookingCancellation(bookingId: string, reason: string) {
  try {
    return this.bookingRepository.transaction(async (tx) => {
      // Get booking details
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, venue: true },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // Process refund if payment exists
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      // Release venue slot
      await tx.venue.update({
        where: { id: booking.venueId },
        data: { availableSlots: { increment: 1 } },
      });

      // Create cancellation record
      await tx.bookingCancellation.create({
        data: {
          bookingId,
          reason,
          refundAmount: booking.payment?.amount || 0,
        },
      });

      return updatedBooking;
    });
  } catch (error) {
    // Transaction will automatically rollback
    console.error('Booking cancellation failed:', error);
    throw error;
  }
}
```

## Nested Transactions and Isolation

### 7. Nested Transaction Pattern
```typescript
async createUserWithInitialData(userData: CreateUserData) {
  return this.userRepository.transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: userData,
    });

    // Nested transaction for profile creation
    const profile = await this.createUserProfileInTransaction(tx, user.id, userData);

    // Create default preferences
    const preferences = await tx.userPreferences.create({
      data: {
        userId: user.id,
        notifications: true,
        theme: 'light',
      },
    });

    return { user, profile, preferences };
  });
}

private async createUserProfileInTransaction(tx: PrismaService, userId: string, userData: CreateUserData) {
  // This method can be called within a transaction
  return tx.profile.create({
    data: {
      userId,
      fullName: userData.fullname,
      avatar: userData.avatar,
    },
  });
}
```

## Performance Optimization with Transactions

### 8. Optimized Batch Operations
```typescript
async bulkCreateBookings(bookingsData: CreateBookingData[]) {
  return this.bookingRepository.transaction(async (tx) => {
    // Use createMany for better performance
    const result = await tx.booking.createMany({
      data: bookingsData,
    });

    // Update venue availability in batch
    const venueUpdates = new Map<string, number>();
    
    bookingsData.forEach(booking => {
      const current = venueUpdates.get(booking.venueId) || 0;
      venueUpdates.set(booking.venueId, current + 1);
    });

    // Batch update venues
    await Promise.all(
      Array.from(venueUpdates.entries()).map(([venueId, count]) =>
        tx.venue.update({
          where: { id: venueId },
          data: { availableSlots: { decrement: count } },
        })
      )
    );

    return result;
  });
}
```

## Real-World Use Cases

### 9. E-commerce Order Processing
```typescript
async processOrder(orderData: CreateOrderData, items: OrderItemData[]) {
  return this.orderRepository.transaction(async (tx) => {
    // Create order
    const order = await tx.order.create({
      data: orderData,
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map(item =>
        tx.orderItem.create({
          data: {
            ...item,
            orderId: order.id,
          },
        })
      )
    );

    // Update inventory
    await Promise.all(
      items.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Create payment record
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        status: 'PENDING',
      },
    });

    // Send confirmation email (non-blocking)
    this.emailService.sendOrderConfirmation(order.id).catch(console.error);

    return { order, orderItems, payment };
  });
}
```

### 10. User Registration with Verification
```typescript
async registerUserWithVerification(userData: CreateUserData) {
  return this.userRepository.transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        ...userData,
        isVerified: false,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Create verification token
    const verificationToken = await tx.verificationToken.create({
      data: {
        userId: user.id,
        token: generateRandomToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Create user profile
    const profile = await tx.userProfile.create({
      data: {
        userId: user.id,
        fullName: userData.fullname,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken.token);

    return { user, profile, verificationToken };
  });
}
```

## Best Practices

### 1. Keep Transactions Short
```typescript
// Good: Short, focused transaction
async updateUserStatus(userId: string, status: UserStatus) {
  return this.userRepository.transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status },
    });

    await tx.userStatusHistory.create({
      data: { userId, status, changedAt: new Date() },
    });

    return user;
  });
}

// Avoid: Long-running operations in transaction
async badExample() {
  return this.userRepository.transaction(async (tx) => {
    // Don't do this - external API calls in transaction
    const externalData = await fetch('https://api.example.com/data');
    
    // Don't do this - file operations in transaction
    await fs.writeFile('large-file.txt', data);
    
    // Transaction should be short and focused
  });
}
```

### 2. Handle Errors Properly
```typescript
async safeTransaction() {
  try {
    return this.userRepository.transaction(async (tx) => {
      // Your transaction logic
    });
  } catch (error) {
    // Handle specific errors
    if (error.code === 'P2002') {
      throw new ConflictException('Duplicate entry');
    }
    throw error;
  }
}
```

### 3. Use Transactions for Data Consistency
```typescript
// Use transactions when multiple operations must succeed or fail together
async transferMoney(fromAccountId: string, toAccountId: string, amount: number) {
  return this.accountRepository.transaction(async (tx) => {
    // Both operations must succeed or both must fail
    await tx.account.update({
      where: { id: fromAccountId },
      data: { balance: { decrement: amount } },
    });

    await tx.account.update({
      where: { id: toAccountId },
      data: { balance: { increment: amount } },
    });

    // Create transaction record
    await tx.transaction.create({
      data: {
        fromAccountId,
        toAccountId,
        amount,
        type: 'TRANSFER',
      },
    });
  });
}
```

## Transaction Isolation Levels

The base repository uses Prisma's default transaction isolation level. For specific isolation requirements, you can configure it:

```typescript
async customIsolationTransaction() {
  return this.prisma.$transaction(async (tx) => {
    // Your transaction logic
  }, {
    isolationLevel: 'ReadCommitted', // or 'Serializable', 'RepeatableRead', 'ReadUncommitted'
  });
}
```

This comprehensive guide shows how to effectively use transactions with the base repository for various scenarios, from simple operations to complex business logic.
