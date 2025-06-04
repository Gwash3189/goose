# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database
- `bin/rails db:create` - Create database
- `bin/rails db:migrate` - Run migrations
- `bin/rails db:seed` - Seed database
- `bin/rails db:reset` - Drop, create, migrate, and seed database

### Testing
- `bundle exec rspec` - Run all tests
- `bundle exec rspec spec/path/to/test_spec.rb` - Run specific test file
- `bundle exec rspec spec/path/to/test_spec.rb:42` - Run specific test at line 42

### Code Quality
- `bundle exec rubocop` - Run Ruby linter
- `bundle exec brakeman` - Run security analysis

### Server
- `bin/rails server` or `bin/rails s` - Start development server
- `bin/rails console` or `bin/rails c` - Start Rails console

## Architecture Overview

This is a Rails 8 API-only application implementing a multi-tenant authentication system with JWT tokens.

### Core Models
- **User**: Authentication entity with email verification, password reset, and sign-in tracking
- **Account**: Multi-tenant organization entity  
- **Membership**: Join table connecting users to accounts with role-based access (owner/member)
- **RefreshToken**: Long-lived tokens for JWT refresh functionality

### Authentication Flow
- JWT-based authentication using `JsonWebToken` concern in `app/controllers/concerns/json_web_token.rb`
- All controllers inherit from `ApplicationController` which includes JWT authentication via `authenticate_user!`
- Auth endpoints are in `AuthController` and skip authentication
- Access tokens contain `user_id` and `account_id` for multi-tenant access control

### API Structure
- All endpoints are namespaced under `/api/v1/`
- Authentication routes: `/api/v1/auth/*` (register, login, logout, refresh, verify-email, forgot-password, reset-password)
- User routes: `/api/v1/users/me` for current user operations
- Account-scoped user routes: `/api/v1/accounts/:id/users`

### Email System
- Uses `UserMailer` for transactional emails (verification, password reset, welcome, etc.)
- Email templates in `app/views/user_mailer/`
- Development uses `letter_opener` gem for email preview

### Testing
- RSpec for testing framework with FactoryBot for fixtures
- Test files mirror app structure in `spec/` directory
- Request specs use `RequestSpecHelper` for authentication helpers