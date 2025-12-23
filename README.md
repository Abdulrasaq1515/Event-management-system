# Events Management System

A production-ready, full-stack events management platform built with modern web technologies. This system demonstrates clean code architecture, comprehensive testing, and professional UI/UX design.

## 🚀 Live Demo

**Frontend & Backend**: [Deployed on Vercel](https://your-deployment-url.vercel.app)
**Database**: PlanetScale MySQL

## 📋 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **TanStack Query** - Data fetching and state management

### Backend
- **Next.js API Routes** - Serverless backend
- **TypeScript** - Full-stack type safety
- **Drizzle ORM** - Type-safe database operations
- **MySQL (PlanetScale)** - Serverless database
- **Zod** - Runtime type validation

### Additional Features
- **Web3.js & Metaplex** - Solana blockchain integration
- **JWT Authentication** - Secure user sessions
- **Property-Based Testing** - Advanced testing methodology
- **Vitest** - Fast unit testing

## 🏗️ Architecture

```
events-management-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # Backend API routes
│   │   ├── events/            # Event management pages
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── events/           # Event-specific components
│   │   ├── ui/               # Base UI components
│   │   ├── web3/             # Web3/NFT components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Core utilities and services
│   │   ├── db/               # Database schema and connection
│   │   ├── services/         # Business logic services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── validations/      # Zod validation schemas
│   │   └── utils/            # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── test/                 # Test utilities and setup
└── .kiro/specs/              # Project specifications and tasks
```

## 🎯 Core Features

### Event Management
- **CRUD Operations**: Create, read, update, delete events
- **Advanced Search**: Full-text search with filtering
- **Event Categories**: Organize events by type
- **Location Support**: Physical and virtual event locations
- **Capacity Management**: Track attendee limits
- **Status Tracking**: Draft, published, cancelled, completed

### User Interface
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Dark Theme**: Professional dark UI with proper contrast
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error boundaries
- **Animations**: Smooth Framer Motion transitions

### Web3 Integration (Bonus)
- **Solana Wallet Connection**: Connect Phantom, Solflare wallets
- **NFT Association**: Link events with Solana NFTs
- **NFT Gallery**: Browse and select wallet NFTs
- **Metadata Display**: Show NFT details and attributes

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PlanetScale account (or MySQL database)

### Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"

# Authentication
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# Web3 (Optional)
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"

# Development
NODE_ENV="development"
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd events-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up database**
```bash
# Push schema to database
npm run db:push

# Generate database client
npm run db:generate
```

4. **Run development server**
```bash
npm run dev
```

5. **Open application**
Navigate to `http://localhost:3000`

## 📊 API Endpoints

### Events API
- `POST /api/events` - Create new event
- `GET /api/events` - List all events (with pagination)
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Request/Response Examples

**Create Event:**
```json
POST /api/events
{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference",
  "startDateTime": "2025-06-15T09:00:00Z",
  "endDateTime": "2025-06-15T17:00:00Z",
  "location": {
    "type": "physical",
    "address": "123 Tech Street",
    "city": "San Francisco",
    "country": "USA"
  },
  "capacity": 500,
  "status": "published",
  "visibility": "public"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt_123",
    "title": "Tech Conference 2025",
    "slug": "tech-conference-2025",
    "version": 1,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Property-based tests
npm run test:pbt

# Test coverage
npm run test:coverage
```

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Property-Based Tests**: Universal correctness properties
- **Integration Tests**: API endpoint testing
- **Type Safety**: Comprehensive TypeScript coverage

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
```bash
npm install -g vercel
vercel login
vercel
```

2. **Configure Environment Variables**
Add all environment variables in Vercel dashboard

3. **Deploy**
```bash
vercel --prod
```

### Database Setup
1. Create PlanetScale database
2. Add connection string to environment variables
3. Push schema: `npm run db:push`

## 🎨 Design System

### Color Palette
- **Background**: `#1a1f2e` (Professional dark)
- **Cards**: `#242938` (Elevated surfaces)
- **Borders**: `#2d3748` (Subtle divisions)
- **Text Primary**: `#ffffff` (High contrast)
- **Text Secondary**: `#94a3b8` (Medium contrast)
- **Accent Blue**: `#3b82f6` (Primary actions)

### Typography
- **Font**: Inter (System fallback)
- **Headings**: Bold, proper hierarchy
- **Body**: Regular weight, optimal line height

## 🔒 Security Features

- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: SameSite cookie configuration
- **Authentication**: JWT with secure headers

## 📈 Performance Optimizations

- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Caching**: TanStack Query with intelligent cache invalidation
- **Bundle Analysis**: Webpack bundle analyzer
- **Database Indexing**: Optimized queries with proper indexes

## 🤝 Code Quality

### Standards
- **ESLint**: Strict linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Naming Conventions**: Clear, descriptive names
- **File Organization**: Logical folder structure

### Best Practices
- **Separation of Concerns**: Clean architecture layers
- **Reusability**: Custom hooks and components
- **Error Handling**: Comprehensive error boundaries
- **Type Safety**: No `any` types, strict TypeScript
- **Documentation**: Clear comments and README

## 📝 Development Notes

### Key Design Decisions
1. **Type Aliases over Interfaces**: Consistent with requirements
2. **Service Layer Pattern**: Clean separation of business logic
3. **Custom Hooks**: Reusable data fetching logic
4. **Property-Based Testing**: Advanced correctness validation
5. **Dark Theme First**: Professional appearance

### Assumptions Made
- Events are owned by individual organizers
- Soft delete for data integrity
- UTC timestamps with timezone support
- NFT integration is optional bonus feature
- Authentication is JWT-based for simplicity

## 🐛 Known Issues & Future Improvements

### Current Limitations
- No real-time updates (could add WebSocket)
- Basic authentication (could add OAuth)
- Single organizer per event (could add teams)

### Future Enhancements
- Email notifications
- Calendar integration
- Payment processing (Stripe)
- Advanced analytics
- Mobile app

## 📞 Support

For questions or issues, please refer to:
- **Documentation**: This README
- **Code Comments**: Inline documentation
- **Type Definitions**: TypeScript interfaces
- **Test Cases**: Example usage patterns

---

**Built with ❤️ using modern web technologies**