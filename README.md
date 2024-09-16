```markdown
# ✈️ Flight Booking API

Welcome to the **Flight Booking API**! This API provides functionality for handling user authentication, managing flight bookings, and payment integration. Whether you're building a flight reservation system or need authentication services, this API has you covered.

## 🛠️ Features

- **User Authentication** (Register, Login, Activate account)
- **Flight Booking Management** (Create, View, Cancel Bookings)
- **Flight Search** (Get available flights)
- **Payment Processing** (Create payment intent)

## 📚 API Endpoints

### Auth Routes
These routes handle user authentication and account activation.

- **Register a new user**
  ```http
  POST /api/auth/register
  ```

- **Login a user**
  ```http
  POST /api/auth/login
  ```

- **Activate an account**
  ```http
  GET /api/auth/activate/:token
  ```

### Booking Routes
These routes allow authenticated users to create, view, and cancel bookings.

- **Create a new booking**
  ```http
  POST /api/bookings/createBookings
  ```
  Requires authentication.

- **Get all bookings**
  ```http
  GET /api/bookings/getBookings
  ```
  Requires authentication.

- **Cancel a booking**
  ```http
  POST /api/bookings/cancelBooking
  ```
  Requires authentication.

### Flight Routes
These routes help users search and manage available flights.

- **Search available flights**
  ```http
  GET /api/flights/
  ```
  Requires authentication.

### Payment Routes
These routes handle payment processing for bookings.

- **Create a payment intent**
  ```http
  POST /api/bookings/create-payment-intent
  ```
  Requires authentication.

## 🔒 Middleware

- **`authenticateToken`**: Ensures that routes are accessed only by authenticated users.

## 🏁 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flight-booking-api.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

4. **Environment Variables**
   Make sure to set the following environment variables in a `.env` file:
   - `JWT_SECRET`: Secret key for JWT authentication.
   - `DATABASE_URL`: URL for your database connection.
   - `PAYMENT_API_KEY`: API key for the payment provider.

### Example: Register a new user
```bash
curl -X POST https://flightbooking-5p50.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

### Example: Create a booking
```bash
curl -X POST https://flightbooking-5p50.onrender.com/api/bookings/createBookings \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"flightId": "12345", "passengerInfo": {"name": "John Doe", "age": 30}}'
```

## 🛡️ Security

- **JWT Authentication** is used to secure the API routes.
- Sensitive routes require the `authenticateToken` middleware.
