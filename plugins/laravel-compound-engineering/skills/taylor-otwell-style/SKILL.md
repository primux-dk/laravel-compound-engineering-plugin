---
name: taylor-otwell-style
description: This skill should be used when writing PHP and Laravel code in Taylor Otwell's distinctive style. It applies when writing PHP code, Laravel applications, creating models, controllers, actions, or any PHP file. Triggers on Laravel code generation, refactoring requests, code review, or when the user mentions Taylor Otwell, Laravel style, or Forge/Vapor patterns. Embodies expressive APIs, fat models, thin controllers, Actions pattern, Livewire, and the "simplicity over cleverness" philosophy.
---

<objective>
Apply Taylor Otwell's Laravel conventions to PHP and Laravel code. This skill provides comprehensive domain expertise extracted from analyzing Laravel core, first-party packages (Jetstream, Fortify, Cashier), Taylor's interviews, and Laravel Cloud patterns.
</objective>

<essential_principles>
## Core Philosophy

"The best code is simple and disposable and easy to change."

**Embrace Laravel conventions:**
- Fat models, thin controllers
- Actions pattern for complex operations
- RESTful resource controllers only
- Eloquent over raw queries
- Database queues over Redis (Laravel 11+)
- Build expressive, memorable APIs

**Taylor's strictest rules:**
- **Never pass boolean flags to methods** - create separate methods instead
- **Method names should be short, memorable, and prosy** - like plain English
- **Clever solutions are a code smell** - stick to documented patterns
- **Design API first** - write pseudo-code of how you want it to look before implementing

**What Taylor embraces:**
- Actions pattern (Jetstream, Fortify)
- Livewire for dynamic interfaces
- Factories for test data
- PEST for testing
- Tailwind CSS
- Rich first-party package ecosystem
- Real-time facades for expressive APIs

**Development Philosophy:**
- Simplicity over everything
- High-level feature tests over unit tests
- Documentation-first releases
- Design for the "average developer"
- Code should be disposable and easy to change
</essential_principles>

<intake>
What are you working on?

1. **Controllers** - REST mapping, Actions delegation, API patterns
2. **Models** - Eloquent, traits, scopes, relationships, accessors
3. **Actions** - Single-responsibility classes for business logic
4. **Views & Frontend** - Livewire, Blade, Alpine.js, Tailwind
5. **Architecture** - Routing, authentication, jobs, events, caching
6. **Testing** - PEST, factories, feature tests
7. **Packages & Dependencies** - What to use vs build
8. **Code Review** - Review code against Taylor's style

**Specify a number or describe your task.**
</intake>

<routing>
| Response | Reference to Read |
|----------|-------------------|
| 1, "controller" | [controllers.md](./references/controllers.md) |
| 2, "model", "eloquent" | [models.md](./references/models.md) |
| 3, "action", "actions" | [controllers.md](./references/controllers.md) + [architecture.md](./references/architecture.md) |
| 4, "view", "frontend", "livewire", "blade", "alpine" | [frontend.md](./references/frontend.md) |
| 5, "architecture", "routing", "auth", "job", "cache" | [architecture.md](./references/architecture.md) |
| 6, "test", "testing", "pest", "factory" | [testing.md](./references/testing.md) |
| 7, "package", "dependency", "library" | [packages.md](./references/packages.md) |
| 8, "review" | Read all references, then review code |

**After reading relevant references, apply patterns to the user's code.**
</routing>

<quick_reference>
## Naming Conventions

| Component | Convention | Example |
|-----------|------------|---------|
| Models | Singular PascalCase | `User`, `TeamMember` |
| Tables | Plural snake_case | `users`, `team_members` |
| Controllers | Singular + Controller | `UserController` |
| Actions | `{Verb}{Noun}` | `CreateTeam`, `DeleteUser` |
| Routes | kebab-case URLs | `/user-profile` |
| Route names | dot.notation | `users.index`, `teams.show` |
| Foreign keys | `{model}_id` | `user_id`, `team_id` |
| Pivot tables | Alphabetical singular | `role_user`, `post_tag` |

## Boolean Flag Rule (Strictest Rule)

```php
// NEVER do this - Taylor would "die on this hill"
$url = url('/path', true);  // What does true mean?
$user->update(['active' => true], false, true);  // Imperceptible

// ALWAYS do this - create separate methods
$url = secureUrl('/path');
$user->forceUpdate(['active' => true]);
$user->updateQuietly(['active' => true]);
```

## REST Mapping

Controllers only use standard resource verbs:

```php
// Standard resource controller
class PhotoController extends Controller
{
    public function index() {}     // GET /photos
    public function create() {}    // GET /photos/create
    public function store() {}     // POST /photos
    public function show() {}      // GET /photos/{photo}
    public function edit() {}      // GET /photos/{photo}/edit
    public function update() {}    // PUT/PATCH /photos/{photo}
    public function destroy() {}   // DELETE /photos/{photo}
}

// Need more actions? Extract a new controller
Route::post('photos/{photo}/publication', [PhotoPublicationController::class, 'store']);
Route::delete('photos/{photo}/publication', [PhotoPublicationController::class, 'destroy']);
```

## Actions Pattern

```php
// app/Actions/Team/CreateTeam.php
class CreateTeam
{
    public function handle(User $user, array $data): Team
    {
        Gate::forUser($user)->authorize('create', Team::class);

        Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
        ])->validate();

        return $user->ownedTeams()->create([
            'name' => $data['name'],
        ]);
    }
}

// Controller delegates to Action
public function store(Request $request, CreateTeam $action)
{
    $team = $action->handle($request->user(), $request->all());
    return redirect()->route('teams.show', $team);
}
```

## Model Patterns

```php
class User extends Authenticatable
{
    // Relationships - plural for hasMany/belongsToMany
    public function posts(): HasMany
    public function teams(): BelongsToMany

    // Relationships - singular for hasOne/belongsTo
    public function profile(): HasOne
    public function company(): BelongsTo

    // Scopes - expressive, chainable
    public function scopeActive(Builder $query): Builder
    public function scopeByRole(Builder $query, string $role): Builder

    // Rich public API that delegates internally
    public function deploy(): void
    {
        DeploySite::dispatch($this);  // Delegates to Job
    }
}
```

## Key Patterns

**Expressive Method Names:**
```php
// Short, memorable, prosy - like plain English
$user->assignRole('admin');
$post->publish();
$team->inviteMember($email);

// Not generic or technical
$user->setRole('admin');      // Too generic
$post->setPublishedAt(now()); // Too implementation-focused
```

**Design-First Development:**
```php
// Write how you WANT to use it first (pseudo-code)
$site->deploy();
$user->teams()->active()->get();
CreateTeam::run($user, $data);

// THEN implement to match that API
```

**Database Transactions:**
```php
return DB::transaction(function () use ($data) {
    $user = User::create($data);
    $user->assignRole('customer');
    return $user;
});
```
</quick_reference>

<reference_index>
## Domain Knowledge

All detailed patterns in `references/`:

| File | Topics |
|------|--------|
| [controllers.md](./references/controllers.md) | REST mapping, Actions delegation, API patterns, form requests |
| [models.md](./references/models.md) | Eloquent, traits, scopes, relationships, accessors, casts |
| [frontend.md](./references/frontend.md) | Livewire components, Blade, Alpine.js, Tailwind patterns |
| [architecture.md](./references/architecture.md) | Routing, authentication, jobs, events, Context, caching |
| [testing.md](./references/testing.md) | PEST, factories, feature tests, mocking, database testing |
| [packages.md](./references/packages.md) | What Taylor uses, decision framework, Spatie packages |
</reference_index>

<success_criteria>
Code follows Taylor's style when:
- Controllers only have standard REST verbs (index, create, store, show, edit, update, destroy)
- Complex logic lives in Actions, not controllers
- Models have rich public APIs but delegate heavy lifting
- No boolean flags passed to methods - ever
- Method names are short, memorable, expressive
- Uses Livewire for dynamic interfaces
- Tests use PEST with factories
- Embraces Laravel conventions over "clever" solutions
- Database transactions wrap related operations
- Tailwind CSS for styling
</success_criteria>

<credits>
Based on extensive research of Taylor Otwell's interviews, podcasts, and code:

- [Taylor Otwell Explains his Coding Style - OfferZen](https://www.offerzen.com/blog/taylor-otwell-explains-his-coding-style)
- [Taylor Otwell: What 14 Years of Laravel Taught Me - Maintainable FM](https://maintainable.fm/episodes/taylor-otwell-what-14-years-of-laravel-taught-me-about-maintainability)
- [Taylor Otwell's opinions - Syntax FM](https://syntax.fm/show/824/taylor-otwell-s-opinions-on-php-react-laravel-and-lamborghini-memes/transcript)
- [Taylor Otwell - Tuple Podcast](https://podcast.tuple.app/episodes/taylor-otwell-creator-of-laravel/transcript)
- [Beware Clever Devs - The Register](https://www.theregister.com/2025/09/01/laravel_inventor_clever_devs/)
- Analysis of Laravel Jetstream, Fortify, and Laravel Cloud codebases

**Important Disclaimers:**
- Research-based guide - may contain inaccuracies
- Not affiliated with or endorsed by Taylor Otwell or Laravel
</credits>
