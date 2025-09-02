@echo off
echo ================================================
echo  🚀 Creando estructura SushiKoi Delivery (TS)
echo ================================================

:: Crear subcarpetas en src
mkdir src\components\common
mkdir src\components\forms
mkdir src\components\maps
mkdir src\components\orders
mkdir src\components\promotions
mkdir src\components\dashboard
mkdir src\components\layout
mkdir src\hooks
mkdir src\services
mkdir src\utils
mkdir src\types
mkdir src\styles

:: Components comunes
type nul > src\components\common\LoadingSpinner.tsx
type nul > src\components\common\ErrorAlert.tsx

:: Forms
type nul > src\components\forms\CustomerForm.tsx
type nul > src\components\forms\PaymentForm.tsx

:: Maps
type nul > src\components\maps\DeliveryMap.tsx
type nul > src\components\maps\AddressMap.tsx

:: Orders
type nul > src\components\orders\OrderCard.tsx
type nul > src\components\orders\DeliveryOrderCard.tsx
type nul > src\components\orders\OrderHistory.tsx

:: Promotions
type nul > src\components\promotions\PromotionCard.tsx

:: Dashboard
type nul > src\components\dashboard\Dashboard.tsx
type nul > src\components\dashboard\MetricsCard.tsx
type nul > src\components\dashboard\TopClients.tsx

:: Layout
type nul > src\components\layout\Header.tsx
type nul > src\components\layout\RoleSelector.tsx
type nul > src\components\layout\TabNavigation.tsx

:: Hooks
type nul > src\hooks\useDebounced.ts
type nul > src\hooks\useTicker.ts
type nul > src\hooks\useLocalStorage.ts
type nul > src\hooks\useGeocoding.ts
type nul > src\hooks\useOrderManager.ts

:: Services
type nul > src\services\geocoding.ts
type nul > src\services\routing.ts
type nul > src\services\storage.ts

:: Utils
type nul > src\utils\formatting.ts
type nul > src\utils\validation.ts
type nul > src\utils\constants.ts
type nul > src\utils\index.ts

:: Types
type nul > src\types\index.ts
type nul > src\types\api.ts
type nul > src\types\components.ts

:: Styles
type nul > src\styles\components.css

echo.
echo ✅ Estructura creada con éxito
pause
