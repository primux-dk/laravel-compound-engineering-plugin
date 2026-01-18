# Architecture - Taylor Otwell Style

<routing>
## Routing

Resource routes for standard CRUD:

```php
// routes/web.php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;

Route::resource('photos', PhotoController::class);
Route::resource('teams', TeamController::class);

// Nested resources
Route::resource('teams.members', TeamMemberController::class)->shallow();

// API resources (no create/edit)
Route::apiResource('api/photos', Api\PhotoController::class);
```

**URL conventions:**
- Plural nouns: `/users`, `/teams`, `/photos`
- Kebab-case: `/user-profiles`, `/team-members`
- Nested: `/teams/{team}/members/{member}`

**Route naming:**
- Dot notation: `teams.index`, `teams.show`, `teams.store`
- Nested: `teams.members.index`, `teams.members.store`

**Route groups:**
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('teams', TeamController::class);
});

Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
    Route::resource('users', Admin\UserController::class);
});
```

**Named routes with parameters:**
```php
route('teams.show', $team);           // /teams/1
route('teams.show', ['team' => $team]); // Explicit
route('teams.members.show', [$team, $member]); // Nested
```
</routing>

<authentication>
## Authentication

Laravel provides flexible auth scaffolding through Breeze, Jetstream, and Fortify.

**Breeze (Taylor's recommendation for most apps):**
```bash
composer require laravel/breeze --dev
php artisan breeze:install livewire
```

Taylor prefers Breeze over Jetstream for most projects:
> "I would pretty much always pick Breeze over Jetstream, valuing full code visibility and control."

**Custom authentication with Actions (Fortify pattern):**
```php
// app/Actions/Fortify/CreateNewUser.php
class CreateNewUser implements CreatesNewUsers
{
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);
    }
}
```

**Password validation rules (Fortify pattern):**
```php
trait PasswordValidationRules
{
    protected function passwordRules(): array
    {
        return ['required', 'string', Password::defaults(), 'confirmed'];
    }
}
```

**Authentication helpers:**
```php
// Current user
$user = auth()->user();
$user = request()->user();
$user = Auth::user();

// Check authentication
if (auth()->check()) { ... }
if (auth()->guest()) { ... }

// Login/logout
Auth::login($user);
Auth::logout();

// Guards
Auth::guard('api')->user();
```
</authentication>

<context_facade>
## Context Facade (Laravel 11+)

Laravel's Context facade provides request-scoped data similar to Rails' CurrentAttributes.

```php
use Illuminate\Support\Facades\Context;

// In middleware
public function handle($request, $next)
{
    Context::add('trace_id', Str::uuid()->toString());
    Context::add('user_id', auth()->id());
    Context::add('tenant_id', $request->route('tenant'));

    return $next($request);
}

// Anywhere in your application
$traceId = Context::get('trace_id');
$userId = Context::get('user_id');

// In logs (automatically included)
Log::info('Processing request'); // Includes context automatically

// Bulk operations
Context::add([
    'key1' => 'value1',
    'key2' => 'value2',
]);

// Check existence
if (Context::has('user_id')) { ... }

// Hidden context (not in logs)
Context::addHidden('api_key', $key);
```

**With jobs (context propagates):**
```php
// Context automatically propagates to queued jobs
ProcessOrder::dispatch($order);

// In the job
public function handle(): void
{
    $tenantId = Context::get('tenant_id'); // Available!
}
```
</context_facade>

<background_jobs>
## Background Jobs

Jobs are thin wrappers that delegate to model methods or Actions.

```php
// app/Jobs/ProcessPodcast.php
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Podcast $podcast,
    ) {}

    public function handle(AudioProcessor $processor): void
    {
        $processor->process($this->podcast);
    }
}

// Dispatch
ProcessPodcast::dispatch($podcast);
ProcessPodcast::dispatch($podcast)->onQueue('processing');
ProcessPodcast::dispatch($podcast)->delay(now()->addMinutes(10));
```

**Job naming:**
- `ProcessPodcast`, `SendWelcomeEmail`, `SyncUserData`
- Verb + Noun pattern

**Database queues (Laravel 11+ default):**
```php
// config/queue.php
'default' => env('QUEUE_CONNECTION', 'database'),

// Create tables
php artisan queue:table
php artisan migrate
```

Taylor's view on database queues:
> "Database queues have become more and more robust, so you can actually use the database driver for queues in production."

**Job middleware:**
```php
class ProcessPodcast implements ShouldQueue
{
    public function middleware(): array
    {
        return [new RateLimited('podcasts')];
    }
}
```

**Retry and failure handling:**
```php
class ProcessPodcast implements ShouldQueue
{
    public int $tries = 3;
    public int $maxExceptions = 2;
    public int $backoff = 60; // seconds

    public function failed(\Throwable $exception): void
    {
        // Handle failure
    }
}
```
</background_jobs>

<events_listeners>
## Events and Listeners

**Event class:**
```php
// app/Events/TeamCreated.php
class TeamCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Team $team,
    ) {}
}
```

**Event naming:**
| Timing | Pattern | Example |
|--------|---------|---------|
| After action | `{Noun}{Verb}ed` | `TeamCreated`, `UserDeleted` |
| Before action | `{Verb}ing{Noun}` | `CreatingTeam`, `DeletingUser` |

**Listener class:**
```php
// app/Listeners/SendTeamCreatedNotification.php
class SendTeamCreatedNotification
{
    public function handle(TeamCreated $event): void
    {
        $event->team->owner->notify(new TeamCreatedNotification($event->team));
    }
}
```

**Listener naming:**
- `SendTeamCreatedNotification`, `UpdateSearchIndex`, `LogActivity`
- Verb + What pattern

**Registering in EventServiceProvider:**
```php
protected $listen = [
    TeamCreated::class => [
        SendTeamCreatedNotification::class,
        UpdateTeamSearchIndex::class,
    ],
];

// Or auto-discovery (Laravel 11+)
public function shouldDiscoverEvents(): bool
{
    return true;
}
```

**Dispatching events:**
```php
// Using event helper
event(new TeamCreated($team));

// Using static dispatch
TeamCreated::dispatch($team);

// In model
class Team extends Model
{
    protected $dispatchesEvents = [
        'created' => TeamCreated::class,
    ];
}
```

**Queued listeners:**
```php
class SendWelcomeEmail implements ShouldQueue
{
    public function handle(UserCreated $event): void
    {
        // Runs in background
    }
}
```
</events_listeners>

<caching>
## Caching

**Basic caching:**
```php
use Illuminate\Support\Facades\Cache;

// Get or set
$users = Cache::remember('users', 3600, function () {
    return User::all();
});

// Forever cache
$settings = Cache::rememberForever('settings', function () {
    return Setting::all()->pluck('value', 'key');
});

// Manual operations
Cache::put('key', 'value', 3600);
Cache::get('key', 'default');
Cache::forget('key');
Cache::flush();
```

**Cache tags (Redis/Memcached only):**
```php
Cache::tags(['teams', 'users'])->put('team.1.members', $members, 3600);
Cache::tags(['teams'])->flush();
```

**Model caching pattern:**
```php
class Team extends Model
{
    public function getCachedMembersAttribute()
    {
        return Cache::remember(
            "team.{$this->id}.members",
            3600,
            fn () => $this->members()->get()
        );
    }

    protected static function booted(): void
    {
        static::updated(function (Team $team) {
            Cache::forget("team.{$team->id}.members");
        });
    }
}
```

**HTTP caching:**
```php
public function show(Team $team)
{
    return response()
        ->view('teams.show', ['team' => $team])
        ->header('Cache-Control', 'public, max-age=3600');
}
```
</caching>

<mail>
## Mail

**Mailable class:**
```php
// app/Mail/TeamInvitation.php
class TeamInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Team $team,
        public string $email,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to join {$this->team->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.team-invitation',
        );
    }
}
```

**Sending mail:**
```php
// Immediate
Mail::to($user)->send(new TeamInvitation($team, $email));

// Queued
Mail::to($user)->queue(new TeamInvitation($team, $email));

// Delayed
Mail::to($user)->later(now()->addMinutes(10), new TeamInvitation($team, $email));
```

**Mailable naming:**
- `WelcomeEmail`, `TeamInvitation`, `OrderConfirmation`
- Descriptive noun or noun phrase
</mail>

<notifications>
## Notifications

**Notification class:**
```php
// app/Notifications/TeamCreated.php
class TeamCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Team $team,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Team Created')
            ->line("Your team {$this->team->name} has been created.")
            ->action('View Team', route('teams.show', $this->team));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'team_id' => $this->team->id,
            'team_name' => $this->team->name,
        ];
    }
}
```

**Sending notifications:**
```php
$user->notify(new TeamCreatedNotification($team));

// Multiple users
Notification::send($users, new TeamCreatedNotification($team));
```
</notifications>

<service_container>
## Service Container

Taylor uses the service container lightly - mostly for third-party services.

**Simple binding:**
```php
// AppServiceProvider
public function register(): void
{
    $this->app->bind(PaymentGateway::class, StripeGateway::class);

    $this->app->singleton(AnalyticsService::class, function ($app) {
        return new AnalyticsService(config('services.analytics.key'));
    });
}
```

**Interface binding:**
```php
$this->app->bind(
    PaymentGatewayContract::class,
    StripeGateway::class
);
```

**Contextual binding:**
```php
$this->app->when(PhotoController::class)
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('photos');
    });
```

**Resolving:**
```php
// Dependency injection (preferred)
public function __construct(
    private PaymentGateway $gateway,
) {}

// Manual resolution
$gateway = app(PaymentGateway::class);
$gateway = resolve(PaymentGateway::class);
```

**Taylor's approach:** Minimal service container usage. Register only:
- Third-party services (Stripe, S3, etc.)
- External libraries
- Interface bindings when needed

Don't register: Actions, repositories, or application services.
</service_container>

<real_time_facades>
## Real-Time Facades

Taylor uses real-time facades for clean, testable APIs.

```php
use Facades\App\Services\PaymentProcessor;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // Real-time facade - no binding needed
        PaymentProcessor::charge($request->user(), $amount);
    }
}

// In tests - automatically mockable
PaymentProcessor::shouldReceive('charge')
    ->once()
    ->with($user, 1000)
    ->andReturn(true);
```

From Taylor's blog:
> "This is not a feature that is littered throughout my code, but I find it occasionally provides a clean, testable approach to writing expressive object APIs."
</real_time_facades>

<configuration>
## Configuration

**Environment variables:**
```php
// config/services.php
return [
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
    ],
];

// Usage
config('services.stripe.key');
```

**Config caching:**
```bash
# Cache for production
php artisan config:cache

# Clear cache
php artisan config:clear
```

**Feature flags (Laravel Pennant):**
```php
use Laravel\Pennant\Feature;

// Define
Feature::define('new-dashboard', fn (User $user) => $user->isAdmin());

// Check
if (Feature::active('new-dashboard')) {
    // Show new dashboard
}

// In Blade
@feature('new-dashboard')
    <x-new-dashboard />
@else
    <x-old-dashboard />
@endfeature
```
</configuration>

<database_patterns>
## Database Patterns

**Migrations:**
```php
public function up(): void
{
    Schema::create('posts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('title');
        $table->text('body');
        $table->timestamp('published_at')->nullable();
        $table->timestamps();

        $table->index('published_at');
    });
}
```

**Foreign key shorthand:**
```php
// Modern syntax (Laravel 7+)
$table->foreignId('user_id')->constrained();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->foreignId('team_id')->nullable()->constrained();

// Custom table
$table->foreignId('author_id')->constrained('users');
```

**Database constraints over validation:**
```php
// Let the database enforce integrity
$table->unique('email');
$table->unique(['team_id', 'user_id']); // Composite unique
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
```

**Transactions:**
```php
DB::transaction(function () {
    $user = User::create($userData);
    $user->teams()->attach($teamId);
    $user->profile()->create($profileData);
});
```
</database_patterns>

<multi_tenancy>
## Multi-Tenancy Patterns

**Scope by tenant:**
```php
// Global scope
class Team extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope('team', function (Builder $builder) {
            if ($teamId = Context::get('team_id')) {
                $builder->where('team_id', $teamId);
            }
        });
    }
}

// Or use middleware + Context
class SetTeamContext
{
    public function handle($request, $next)
    {
        if ($team = $request->user()?->currentTeam) {
            Context::add('team_id', $team->id);
        }

        return $next($request);
    }
}
```

**Always scope through tenant:**
```php
// Good - scoped
$projects = $request->user()->currentTeam->projects;

// Avoid - global lookup
$project = Project::find($id);
```
</multi_tenancy>
