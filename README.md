# 🔐 Goose Authentication Service

A production-ready, multi-tenant authentication API built with Ruby on Rails. Designed to be secure, scalable, and easy to integrate into your applications.

## ✨ Features

- **🔒 Secure Authentication**: JWT-based auth with industry-standard security practices
- **🏢 Multi-tenant**: Support for multiple organizations/accounts out of the box  
- **📧 Email Workflows**: Complete email verification, password reset, and notification system
- **🛡️ Rate Limiting**: Built-in protection against brute force attacks
- **🎭 Role-based Access**: Owner, admin, and member roles with proper permissions
- **📱 Device Management**: Track logins across different devices with notifications
- **🧪 Well Tested**: Comprehensive test suite with 83 examples and 100% pass rate
- **🚀 Production Ready**: Follows Rails best practices and REST API standards

## 🚀 Quick Start

### Prerequisites

- Ruby 3.3+ 
- Rails 8.0+
- SQLite (development) or PostgreSQL (production)
- Redis (for caching and background jobs)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/goose.git
   cd goose
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Set up the database**
   ```bash
   bin/rails db:create
   bin/rails db:migrate
   bin/rails db:seed
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Start the server**
   ```bash
   bin/rails server
   ```

Your API will be available at `http://localhost:3000` 🎉

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# App Configuration
APP_NAME="Your App Name"
APP_HOST="localhost:3000"
FRONTEND_URL="http://localhost:3001"

# Email Configuration  
SUPPORT_EMAIL="support@yourapp.com"
DEFAULT_FROM_EMAIL="noreply@yourapp.com"

# SMTP Settings (for production)
SMTP_ADDRESS="smtp.gmail.com"
SMTP_PORT="587"
SMTP_DOMAIN="yourapp.com"
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-password"
SMTP_AUTHENTICATION="plain"
```

### JWT Secret

Generate a secure JWT secret:
```bash
bin/rails credentials:edit
```

Add your secret key:
```yaml
secret_key_base: your-very-secure-secret-key-here
```

## 📚 API Documentation

### Authentication Endpoints

All authentication endpoints are prefixed with `/api/v1/auth/`

#### Register a New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "account_name": "My Company" // Optional: creates new account
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "SecurePass123",
  "device_name": "iPhone 15", // Optional
  "account_id": 1 // Optional: specific account context
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### Password Reset
```http
# Request password reset
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

# Reset password with token
POST /api/v1/auth/reset-password  
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123"
}
```

### User Management Endpoints

All user endpoints require authentication via `Authorization: Bearer <access-token>`

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <access-token>
```

#### Update User Profile
```http
PATCH /api/v1/users/me
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "user": {
    "full_name": "Jane Doe"
  }
}
```

#### Change Password
```http
PATCH /api/v1/users/me/password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "user": {
    "current_password": "OldPass123",
    "new_password": "NewSecurePass123"
  }
}
```

### Response Format

#### Success Response
```json
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "dGhpcyBp...", 
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Error Response
```json
{
  "error": "Validation Failed",
  "message": "The request contains invalid parameters", 
  "details": {
    "email": ["can't be blank"],
    "password": ["is too short (minimum is 8 characters)"]
  }
}
```

## 🏗️ Development

### Running Tests

```bash
# Run the full test suite
bundle exec rspec

# Run specific test file
bundle exec rspec spec/controllers/api/v1/auth_controller_spec.rb

# Run specific test 
bundle exec rspec spec/controllers/api/v1/auth_controller_spec.rb:28
```

### Code Quality

```bash
# Run linter
bundle exec rubocop

# Auto-fix linting issues
bundle exec rubocop -A

# Run security analysis
bundle exec brakeman
```

### Database Operations

```bash
# Create and run migrations
bin/rails db:create db:migrate

# Reset database (⚠️ destroys data)
bin/rails db:reset

# Create a new migration
bin/rails generate migration AddFieldToUsers field:string
```

### Background Jobs

This app uses Solid Queue for background job processing:

```bash
# In development, jobs run inline
# For production, start the job worker:
bin/rails solid_queue:start
```

## 🏛️ Architecture

### Multi-tenancy Model

The service uses a clean multi-tenant architecture:

- **Users** belong to one or more **Accounts** through **Memberships**
- **Memberships** define roles: `owner`, `admin`, or `member`
- JWT tokens include both `user_id` and `account_id` for context

### Security Features

- **Rate Limiting**: 5 login attempts per 15 minutes, 3 registration attempts per hour
- **Strong Passwords**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Secure Tokens**: URL-safe tokens for email verification and password resets
- **Device Tracking**: Monitor logins across different devices and IPs
- **Token Expiration**: Short-lived access tokens (24 hours) with refresh capability

### Email System

- **Verification**: Welcome users and verify email addresses
- **Password Reset**: Secure password reset flow with 2-hour token expiry
- **Security Alerts**: Notify users of password changes and new device logins
- **Background Processing**: All emails sent via background jobs for performance

## 🤝 Contributing

We love contributions! Here's how to get started:

### Setting Up for Development

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/goose.git
   cd goose
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

4. **Set up your development environment**
   ```bash
   bundle install
   bin/rails db:create db:migrate
   ```

5. **Run the tests** to make sure everything works
   ```bash
   bundle exec rspec
   bundle exec rubocop
   ```

### Making Changes

1. **Write tests first** - We practice TDD and maintain 100% test coverage
2. **Follow the style guide** - Run `bundle exec rubocop` to check
3. **Keep commits focused** - One feature/fix per commit
4. **Write clear commit messages** - Explain what and why, not just what

### Code Style

- Follow the existing code patterns
- Use meaningful variable and method names
- Add comments for complex business logic
- Prefer explicit over implicit when it improves clarity

### Testing Guidelines

- **Unit tests** for models and individual methods
- **Integration tests** for API endpoints and workflows  
- **Minimal mocking** - Test real behavior when possible
- **Test edge cases** - Error conditions, validation failures, etc.

### Submitting Changes

1. **Push to your fork**
   ```bash
   git push origin feature/amazing-new-feature
   ```

2. **Create a Pull Request** on GitHub
   - Include a clear description of your changes
   - Reference any related issues
   - Include screenshots for UI changes

3. **Wait for review** - We'll provide feedback and work with you to get it merged

## 🚀 Deployment

### Environment Setup

For production deployment, ensure you have:

- PostgreSQL database
- Redis for caching and background jobs
- SMTP server for email delivery
- SSL certificate for HTTPS

### Docker Deployment

```dockerfile
# Example Dockerfile usage
FROM ruby:3.3

WORKDIR /app
COPY Gemfile* ./
RUN bundle install

COPY . .
RUN bin/rails assets:precompile

EXPOSE 3000
CMD ["bin/rails", "server", "-b", "0.0.0.0"]
```

### Heroku Deployment

```bash
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL and Redis
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set APP_NAME="Your App"
heroku config:set FRONTEND_URL="https://yourfrontend.com"

# Deploy
git push heroku main
heroku run rails db:migrate
```

## 🆘 Troubleshooting

### Common Issues

**"JWT secret key not configured"**
- Make sure you've set up Rails credentials: `bin/rails credentials:edit`

**Email not sending in development**
- Check that `letter_opener` is working: emails should open in your browser
- For production, verify SMTP settings in your environment variables

**Tests failing with password validation errors**
- Ensure test passwords meet requirements: minimum 8 chars with uppercase, lowercase, and numbers
- Example valid password: `"Password123"`

**Rate limiting in development**
- Rate limits are enabled by default. Clear Rails cache: `bin/rails dev:cache` (if enabled)

### Getting Help

- 📖 Check the [API documentation](#-api-documentation) above
- 🐛 [Open an issue](https://github.com/yourusername/goose/issues) for bugs
- 💡 [Start a discussion](https://github.com/yourusername/goose/discussions) for questions
- 📧 Email support at your-support-email@domain.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Ruby on Rails](https://rubyonrails.org/) 
- Authentication inspired by industry best practices
- Thank you to all contributors who help make this project better!

---

**Happy coding!** 🚀 If you find this project useful, please consider giving it a ⭐ on GitHub.