# Booksan Owner App

A modern, mobile-first owner dashboard for the Booksan sports venue booking platform. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Modules

1. **Venue Management**
   - Create, edit, and manage sports venues
   - Upload and manage gallery images
   - Address management with geocoding
   - Publish/unpublish venues
   - Real-time availability status

2. **Payment Configuration (P2P)**
   - Configure accepted payment methods
   - Bank account management
   - QR code upload for payments
   - Custom transfer note templates
   - Live payment instruction preview

3. **Booking Flow**
   - View and manage all bookings
   - Create new bookings for customers
   - Real-time price simulation
   - Edit and cancel bookings
   - Mark payments as received
   - Export booking data to CSV

### Technical Features

- **Authentication**: HTTP-only cookie sessions with NestJS backend
- **Mobile-first**: Responsive design optimized for mobile devices
- **Real-time**: Live updates and validations
- **Type-safe**: Full TypeScript implementation
- **Form Validation**: Zod schemas with react-hook-form
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date operations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Forms**: react-hook-form + @hookform/resolvers
- **Validation**: Zod
- **Icons**: Lucide React
- **Date Library**: date-fns
- **HTTP Client**: Fetch API with custom wrapper

## 📦 Installation

1. **Clone and navigate to the project**:
   ```bash
   cd booksan-owner_fe
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/v1
   NEXT_PUBLIC_APP_NAME=Booksan Owner
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── venues/            # Venue management pages
│   ├── bookings/          # Booking management pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── layout/           # Layout components
│   ├── venues/           # Venue-specific components
│   ├── bookings/         # Booking-specific components
│   └── payments/         # Payment-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api/             # API client and endpoints
│   ├── auth.ts          # Authentication service
│   ├── api.ts           # Base API client
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware for auth
```

## 🔐 Authentication

The app uses HTTP-only cookies for secure session management:

- **Session Storage**: HTTP-only cookies (not accessible via JavaScript)
- **Token Refresh**: Automatic token refresh on API calls
- **Route Protection**: Middleware-based route protection
- **Role-based Access**: Only OWNER role users can access the dashboard

## 📱 Mobile-First Design

The application is designed with a mobile-first approach:

- **Responsive Layout**: Adapts to all screen sizes
- **Touch-Friendly**: Large touch targets and gestures
- **Progressive Enhancement**: Desktop features enhance mobile experience
- **Optimized Performance**: Fast loading and smooth interactions

## 🎨 UI/UX Features

- **Dashboard Navigation**: Collapsible sidebar with mobile sheet
- **Toast Notifications**: Success/error feedback
- **Loading States**: Skeleton loaders and loading indicators
- **Empty States**: Helpful messages when no data is available
- **Confirmation Dialogs**: Destructive action confirmations
- **Form Validation**: Real-time validation with clear error messages

## 🔧 API Integration

The app integrates with the existing Booksan NestJS backend:

- **Base URL**: Configurable via environment variables
- **Authentication**: Bearer token with automatic refresh
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript types for API responses

### API Endpoints Used

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `GET /courts` - List venues/courts
- `POST /courts` - Create venue
- `PUT /courts/:id` - Update venue
- `DELETE /courts/:id` - Delete venue
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `POST /bookings/simulate-price` - Price simulation
- `GET /payments/config` - Get payment configuration
- `PUT /payments/config` - Update payment configuration

## 🧪 Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:check` - Check linting without fixing
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Quality

- **ESLint**: Strict linting rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **No `any` types**: Type-safe implementation

## 🚦 Usage

### First Time Setup

1. **Login**: Use your owner credentials to access the dashboard
2. **Create Venues**: Add your first sports venue with complete address
3. **Configure Payments**: Set up your payment methods and bank details
4. **Start Booking**: Create bookings for your customers

### Daily Operations

1. **Monitor Bookings**: Check today's bookings and upcoming reservations
2. **Manage Payments**: Mark payments as received and track outstanding payments
3. **Update Venues**: Modify venue details, images, and availability
4. **Export Data**: Download booking reports for accounting

## 🔒 Security Features

- **HTTP-only Cookies**: Secure session storage
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Input Validation**: Comprehensive Zod validation schemas
- **XSS Prevention**: React's built-in XSS protection
- **Secure Headers**: Next.js security headers

## 📊 Performance

- **Server Components**: Leverage Next.js Server Components for better performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimized images
- **Bundle Analysis**: Optimized bundle size

## 🤝 Contributing

This is a production-ready MVP. For any issues or feature requests, please contact the development team.

## 📄 License

Private - Booksan Platform