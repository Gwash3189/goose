Rails.application.routes.draw do
  resources :customers do
    resources :accounts do
      resources :users
    end
    resources :api_keys do
      put 'rotate', to: 'api_keys#rotate'
      patch 'rotate', to: 'api_keys#rotate'

    end

  end


  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "/health" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
