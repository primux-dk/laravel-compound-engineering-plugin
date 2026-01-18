# Packages - Taylor Otwell Style

<laravel_first_party>
## Laravel First-Party Packages

Taylor maintains a rich ecosystem of official packages:

**Authentication & Authorization:**
- **Breeze** - Minimal auth scaffolding (Taylor's recommendation)
- **Jetstream** - Full-featured auth with teams
- **Fortify** - Headless auth backend
- **Sanctum** - API token authentication
- **Passport** - Full OAuth2 server

**Development & Debugging:**
- **Telescope** - Debug assistant
- **Pint** - Code style fixer (PSR-12)
- **Sail** - Docker development environment
- **Valet** - macOS development environment
- **Herd** - Native Laravel development (Taylor's daily driver)

**Infrastructure:**
- **Horizon** - Queue monitoring (Redis)
- **Pulse** - Application performance monitoring
- **Pennant** - Feature flags

**Payments:**
- **Cashier** - Stripe/Paddle subscription billing
- **Spark** - SaaS billing starter kit

**Deployment:**
- **Forge** - Server management
- **Vapor** - Serverless deployment (AWS Lambda)
- **Envoyer** - Zero-downtime deployment
</laravel_first_party>

<what_taylor_uses>
## What Taylor Uses

From analysis of Laravel Cloud and Taylor's recommendations:

**Essential on every project:**
```php
// Taylor installs this on nearly every project
composer require spatie/once
```
The `once()` helper memoizes closure results per request, preventing duplicate queries.

**Authentication:**
```bash
# Taylor's recommendation for most apps
composer require laravel/breeze --dev
php artisan breeze:install livewire

# Why Breeze over Jetstream:
# "Full code visibility and control"
# "Jetstream's hidden complexity limits customization"
```

**Code Style:**
```bash
# Laravel Pint for code formatting
composer require laravel/pint --dev
./vendor/bin/pint
```

**Testing:**
```bash
# PEST as preferred test framework
composer require pestphp/pest --dev
composer require pestphp/pest-plugin-laravel --dev
```

**Database:**
- Database queues (Laravel 11+ default)
- Database cache when Redis isn't needed
- SQLite for development, MySQL/PostgreSQL for production

**Monitoring:**
- Sentry or BugSnag for error tracking
- Laravel Pulse for performance
- Papertrail for logs
</what_taylor_uses>

<spatie_packages>
## Spatie Packages

Spatie packages are widely trusted in the Laravel ecosystem (1+ billion downloads).

**Commonly used:**
```bash
# Roles and permissions
composer require spatie/laravel-permission

# Activity logging
composer require spatie/laravel-activitylog

# Media library
composer require spatie/laravel-medialibrary

# Data transfer objects
composer require spatie/laravel-data

# Query builder for APIs
composer require spatie/laravel-query-builder

# Settings
composer require spatie/laravel-settings

# Backup
composer require spatie/laravel-backup

# Model states
composer require spatie/laravel-model-states
```

**Taylor's memoization helper:**
```php
use function Spatie\Once\once;

class User extends Model
{
    public function expensiveCalculation()
    {
        return once(function () {
            // This runs only once per request per instance
            return $this->orders->sum('total');
        });
    }
}
```
</spatie_packages>

<package_ecosystem>
## Popular Community Packages

**Forms & UI:**
```bash
# Filament - Admin panel and form builder
composer require filament/filament

# LivewireUI - Modal component
composer require wire-elements/modal
```

**APIs:**
```bash
# API documentation
composer require dedoc/scramble

# API resources
composer require spatie/laravel-json-api-paginate
```

**Development:**
```bash
# IDE helper
composer require barryvdh/laravel-ide-helper --dev

# Debug bar
composer require barryvdh/laravel-debugbar --dev
```

**Search:**
```bash
# Full-text search with Scout
composer require laravel/scout

# Meilisearch driver
composer require meilisearch/meilisearch-php
```
</package_ecosystem>

<decision_framework>
## Decision Framework

Before adding a package, ask:

**1. Does Laravel already do this?**
```php
// Laravel has built-in solutions for many common needs:
// - Authentication: Breeze, Fortify, Jetstream
// - Queues: Built-in job system
// - Cache: Multiple drivers included
// - Mail: Built-in Mailable classes
// - Notifications: Multi-channel built-in
```

**2. Is the complexity worth it?**
> "Clever solutions are a code smell" - Taylor Otwell

- Simple custom code vs. complex package
- Will you use most of the package's features?
- Does it add patterns your team doesn't know?

**3. Is it well-maintained?**
- Check last commit date
- Check open issues count
- Check Laravel version compatibility
- Prefer packages from trusted sources (Laravel, Spatie)

**4. Does it follow Laravel conventions?**
- Uses service providers properly
- Respects Laravel's patterns
- Good documentation
- Tested

**Taylor's philosophy:**
> "Getting the best from Laravel means embracing how it is designed to work."

Use packages that enhance Laravel, not fight against it.
</decision_framework>

<avoid_these>
## What to Avoid

**Over-abstraction packages:**
```php
// Avoid heavy "enterprise" patterns unless you need them
// - Repository pattern packages (Eloquent is your repository)
// - Complex service layer packages
// - Heavy DI containers (Laravel's is sufficient)
```

**Fighting Laravel:**
```php
// If a package requires you to:
// - Abandon Eloquent for a different ORM
// - Use a completely different routing system
// - Replace Blade with a different templating engine
// ...you're probably fighting Laravel
```

**Unmaintained packages:**
- No updates in 6+ months
- Doesn't support current Laravel version
- Many open issues without responses

**Over-complicated auth:**
```php
// Don't add complexity for complexity's sake
// Taylor's recommendation:
// 1. Start with Breeze
// 2. Customize as needed
// 3. You have full control over the code
```
</avoid_these>

<factory_vs_custom>
## Use Factory Classes

Taylor uses factory classes over heavy DI in Laravel Cloud:

```php
// app/Factories/ServerProviderFactory.php
class ServerProviderFactory
{
    public function make(string $provider): ServerProvider
    {
        return match ($provider) {
            'digitalocean' => new DigitalOceanProvider(),
            'aws' => new AwsProvider(),
            'linode' => new LinodeProvider(),
            default => throw new InvalidArgumentException("Unknown provider: {$provider}"),
        };
    }
}

// Usage
$provider = app(ServerProviderFactory::class)->make('digitalocean');
```

**Benefits:**
- More discoverable than service container bindings
- Explicit instantiation logic
- Easy to trace code flow
- No magic
</factory_vs_custom>

<composer_practices>
## Composer Practices

**Require vs require-dev:**
```json
{
    "require": {
        "laravel/framework": "^12.0",
        "livewire/livewire": "^3.0",
        "spatie/laravel-permission": "^6.0"
    },
    "require-dev": {
        "laravel/pint": "^1.0",
        "laravel/sail": "^1.0",
        "pestphp/pest": "^3.0",
        "pestphp/pest-plugin-laravel": "^3.0"
    }
}
```

**Keep dependencies minimal:**
```bash
# Audit what you actually use
composer show --installed

# Remove unused packages
composer remove package/name
```

**Lock file:**
- Always commit `composer.lock`
- Use `composer install` in CI/production (uses lock file)
- Use `composer update` only when intentionally updating

**Scripts:**
```json
{
    "scripts": {
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "lint": "pint",
        "test": "pest",
        "test:coverage": "pest --coverage"
    }
}
```
</composer_practices>

<package_patterns>
## Package Usage Patterns

**Roles and Permissions (Spatie):**
```php
// Assign role
$user->assignRole('admin');

// Check permission
if ($user->can('edit articles')) { ... }

// In middleware
Route::middleware(['role:admin'])->group(function () {
    // Admin routes
});

// In Blade
@role('admin')
    <a href="/admin">Admin Panel</a>
@endrole
```

**Activity Log (Spatie):**
```php
// Automatic logging
class Post extends Model
{
    use LogsActivity;

    protected static $logAttributes = ['title', 'body'];
}

// Manual logging
activity()
    ->performedOn($post)
    ->causedBy($user)
    ->log('Post was published');
```

**Media Library (Spatie):**
```php
class User extends Model
{
    use InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile();
    }
}

// Upload
$user->addMediaFromRequest('avatar')->toMediaCollection('avatar');

// Retrieve
$user->getFirstMediaUrl('avatar');
```

**Laravel Data (Spatie):**
```php
class PostData extends Data
{
    public function __construct(
        public string $title,
        public string $body,
        public ?Carbon $published_at,
    ) {}
}

// From request
$data = PostData::from($request);

// To model
$post = Post::create($data->toArray());
```
</package_patterns>
