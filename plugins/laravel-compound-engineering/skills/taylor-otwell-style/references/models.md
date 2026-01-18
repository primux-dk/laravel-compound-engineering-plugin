# Models - Taylor Otwell Style

<fat_models>
## Fat Models, Thin Controllers

Taylor prefers rich models with expressive public APIs. The model exposes clean interfaces but can delegate internally.

```php
class Site extends Model
{
    // Rich public API - reads like English
    public function deploy(): void
    {
        DeploySite::dispatch($this);  // Delegates to Job
    }

    public function isDeployable(): bool
    {
        return $this->status === 'ready' && $this->hasValidCertificate();
    }

    public function provision(): void
    {
        ProvisionServer::dispatch($this);
    }
}

// Usage reads naturally
$site->deploy();
if ($site->isDeployable()) { ... }
```

**Key insight:** Just because logic is exposed via the model's public API doesn't mean all code lives in the model. Delegate to Jobs, Actions, or other classes.
</fat_models>

<traits_mixins>
## Traits for Horizontal Behavior

Use traits for reusable model behavior (Laravel's version of Ruby concerns).

```php
// app/Models/Concerns/HasTeams.php
trait HasTeams
{
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class);
    }

    public function ownedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    public function belongsToTeam(Team $team): bool
    {
        return $this->teams->contains($team);
    }

    public function ownsTeam(Team $team): bool
    {
        return $this->id === $team->owner_id;
    }

    public function switchTeam(Team $team): void
    {
        $this->forceFill(['current_team_id' => $team->id])->save();
    }
}

// app/Models/Concerns/HasProfilePhoto.php
trait HasProfilePhoto
{
    public function profilePhotoUrl(): Attribute
    {
        return Attribute::get(function () {
            return $this->profile_photo_path
                ? Storage::url($this->profile_photo_path)
                : $this->defaultProfilePhotoUrl();
        });
    }

    protected function defaultProfilePhotoUrl(): string
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name);
    }

    public function updateProfilePhoto(UploadedFile $photo): void
    {
        $this->forceFill([
            'profile_photo_path' => $photo->storePublicly('profile-photos'),
        ])->save();
    }
}
```

**Trait naming (Jetstream patterns):**
| Pattern | Example |
|---------|---------|
| `Has{Feature}` | `HasTeams`, `HasProfilePhoto`, `HasApiTokens` |
| `{Verb}s{Feature}` | `ConfirmsPasswords`, `ManagesProfilePhotos` |
| `InteractsWith{Feature}` | `InteractsWithBanner` |

**Using traits:**
```php
class User extends Authenticatable
{
    use HasTeams;
    use HasProfilePhoto;
    use HasApiTokens;
}
```
</traits_mixins>

<relationships>
## Relationship Conventions

**Naming:**
| Relationship | Method Name | Example |
|--------------|-------------|---------|
| `hasOne` | Singular | `profile()`, `address()` |
| `hasMany` | Plural | `posts()`, `comments()` |
| `belongsTo` | Singular | `user()`, `team()` |
| `belongsToMany` | Plural | `roles()`, `permissions()` |
| `hasManyThrough` | Plural | `posts()`, `deployments()` |

```php
class User extends Model
{
    // hasOne - singular
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    // hasMany - plural
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // belongsToMany - plural
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    // Custom foreign key
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'employer_id');
    }
}
```

**Pivot table conventions:**
```php
// Alphabetical order, singular
// role_user (not user_role, not roles_users)
// post_tag (not tag_post, not posts_tags)

public function roles(): BelongsToMany
{
    return $this->belongsToMany(Role::class)
        ->withTimestamps()
        ->withPivot('assigned_by');
}
```

**Eager loading:**
```php
// Always eager load to avoid N+1
$users = User::with(['posts', 'profile'])->get();

// Nested eager loading
$users = User::with(['posts.comments.author'])->get();

// Constrained eager loading
$users = User::with(['posts' => function ($query) {
    $query->where('published', true);
}])->get();
```
</relationships>

<scopes>
## Query Scopes

Scopes make queries expressive and chainable.

```php
class Post extends Model
{
    // Simple scopes
    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at');
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->whereNull('published_at');
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderByDesc('created_at');
    }

    // Parameterized scopes
    public function scopeByAuthor(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    // Date scopes
    public function scopeCreatedAfter(Builder $query, Carbon $date): Builder
    {
        return $query->where('created_at', '>=', $date);
    }
}

// Usage - reads like English
Post::published()->recent()->get();
Post::byAuthor($user)->published()->paginate();
Post::draft()->byStatus('review')->count();
```

**Standard scope naming:**
- `published()`, `draft()`, `active()`, `inactive()` - state filters
- `recent()`, `oldest()`, `latest()` - ordering
- `byUser()`, `byTeam()`, `byStatus()` - parameterized filters
- `withRelation()` - eager loading presets
</scopes>

<accessors_mutators>
## Accessors and Mutators

Use the Attribute class for modern accessor/mutator syntax.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Model
{
    // Accessor only
    protected function fullName(): Attribute
    {
        return Attribute::get(
            fn () => "{$this->first_name} {$this->last_name}"
        );
    }

    // Mutator only
    protected function password(): Attribute
    {
        return Attribute::set(
            fn (string $value) => bcrypt($value)
        );
    }

    // Both accessor and mutator
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => strtolower($value),
            set: fn (string $value) => strtolower($value),
        );
    }

    // Cached accessor (computed once per instance)
    protected function profilePhotoUrl(): Attribute
    {
        return Attribute::get(function () {
            return $this->profile_photo_path
                ? Storage::url($this->profile_photo_path)
                : $this->defaultProfilePhotoUrl();
        })->shouldCache();
    }
}

// Usage
$user->full_name;  // Calls fullName accessor
$user->password = 'secret';  // Calls password mutator
```

**Add to $appends for JSON/array serialization:**
```php
protected $appends = ['full_name', 'profile_photo_url'];
```
</accessors_mutators>

<casts>
## Attribute Casting

Use casts for automatic type conversion.

```php
class User extends Model
{
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_admin' => 'boolean',
            'settings' => 'array',
            'metadata' => 'collection',
            'options' => AsStringable::class,
            'address' => AddressCast::class,
            'secret' => 'encrypted',
            'secret_array' => 'encrypted:array',
        ];
    }
}
```

**Common casts:**
- `boolean`, `integer`, `float`, `string` - primitives
- `array`, `collection`, `object` - complex types
- `datetime`, `date`, `timestamp` - dates
- `encrypted`, `encrypted:array` - encryption
- `hashed` - auto-hash on set (Laravel 10+)

**Enum casting (PHP 8.1+):**
```php
enum UserStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';
}

class User extends Model
{
    protected function casts(): array
    {
        return [
            'status' => UserStatus::class,
        ];
    }
}

// Usage
$user->status = UserStatus::Active;
$user->status->value; // 'active'
```
</casts>

<method_naming>
## Method Naming

Taylor emphasizes short, memorable, prosy method names - like plain English.

```php
// ✓ Good - expressive, reads like English
$user->assignRole('admin');
$post->publish();
$team->inviteMember($email);
$site->deploy();
$order->markAsPaid();

// ❌ Bad - generic, technical, verbose
$user->setRole('admin');
$post->setPublishedAt(now());
$team->addUserToTeam($email);
$site->triggerDeployment();
$order->updatePaymentStatus('paid');
```

**Predicates return boolean:**
```php
$user->isAdmin();
$post->isPublished();
$team->hasMembers();
$site->canDeploy();
$order->isPaid();
```

**Action methods are imperative:**
```php
$user->ban();
$user->restore();
$post->archive();
$team->dissolve();
```
</method_naming>

<events>
## Model Events

Use model events for side effects, or dispatch custom events.

```php
class User extends Model
{
    protected $dispatchesEvents = [
        'created' => UserCreated::class,
        'deleted' => UserDeleted::class,
    ];

    // Or use closures in boot
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // Side effect after creation
        });

        static::deleting(function (User $user) {
            // Cleanup before deletion
        });
    }
}
```

**Event class:**
```php
class UserCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public User $user,
    ) {}
}
```

**Listener:**
```php
class SendWelcomeEmail
{
    public function handle(UserCreated $event): void
    {
        Mail::to($event->user)->send(new WelcomeMail($event->user));
    }
}
```
</events>

<mass_assignment>
## Mass Assignment

Use `$fillable` or `$guarded` to protect against mass assignment.

```php
class Post extends Model
{
    // Whitelist approach (preferred)
    protected $fillable = [
        'title',
        'body',
        'published_at',
    ];

    // Or blacklist approach
    protected $guarded = ['id', 'created_at', 'updated_at'];

    // Or guard nothing (use with caution)
    protected $guarded = [];
}
```

**Creating records:**
```php
// Mass assignment with create
$post = Post::create([
    'title' => 'My Post',
    'body' => 'Content here',
]);

// Or with fill + save
$post = new Post;
$post->fill($request->validated());
$post->user_id = auth()->id();
$post->save();

// Force fill (bypasses guarded)
$post->forceFill(['admin_notes' => 'Internal note'])->save();
```
</mass_assignment>

<transactions>
## Database Transactions

Wrap related operations in transactions for data integrity.

```php
use Illuminate\Support\Facades\DB;

// Simple transaction
$user = DB::transaction(function () use ($data) {
    $user = User::create($data);
    $user->assignRole('customer');
    $user->profile()->create(['bio' => '']);
    return $user;
});

// With manual control
DB::beginTransaction();

try {
    $user = User::create($data);
    $user->assignRole('customer');
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}

// Nested transactions (savepoints)
DB::transaction(function () {
    User::create(['name' => 'Parent']);

    DB::transaction(function () {
        User::create(['name' => 'Child']);
    });
});
```
</transactions>

<soft_deletes>
## Soft Deletes

Use soft deletes when you need to retain deleted records.

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;
}

// Migration
$table->softDeletes();

// Usage
$post->delete();           // Soft delete
$post->forceDelete();      // Permanent delete
$post->restore();          // Restore

// Querying
Post::withTrashed()->get();    // Include soft deleted
Post::onlyTrashed()->get();    // Only soft deleted
```
</soft_deletes>

<observers>
## Model Observers

For complex event handling, use observers.

```php
// app/Observers/UserObserver.php
class UserObserver
{
    public function created(User $user): void
    {
        // After user created
    }

    public function updated(User $user): void
    {
        // After user updated
    }

    public function deleted(User $user): void
    {
        // After user deleted
    }

    public function forceDeleted(User $user): void
    {
        // After user force deleted
    }
}

// Register in AppServiceProvider
public function boot(): void
{
    User::observe(UserObserver::class);
}

// Or use ObservedBy attribute (Laravel 10+)
#[ObservedBy(UserObserver::class)]
class User extends Model
{
    // ...
}
```
</observers>
