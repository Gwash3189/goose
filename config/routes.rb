# config/routes.rb
Rails.application.routes.draw do
  get "health" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Scope auth routes to api/v1/auth/* but use the AuthController
      scope :auth do
        post "register", to: "auth#register"
        post "login", to: "auth#login"
        post "logout", to: "auth#logout"
        post "refresh", to: "auth#refresh"
        post "verify-email", to: "auth#verify_email"
        post "forgot-password", to: "auth#forgot_password"
        post "reset-password", to: "auth#reset_password"
      end

      # Remove :create from users routes since registration is handled by auth#register
      resources :users, only: [] do
        collection do
          get "me", to: "users#me"
          patch "me", to: "users#update"
          patch "me/password", to: "users#update_password"
        end
      end

      resources :accounts, only: [] do
        resources :users, only: [ :index ], controller: "users"
      end
    end
  end
end
