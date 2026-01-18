# Controllers - Taylor Otwell Style

<rest_mapping>
## Everything Maps to CRUD

Controllers only use standard resource verbs. Need custom actions? Extract a new controller.

```php
// Standard resource controller - only these 7 methods
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
```

**Verb-to-noun conversion:**
| Action | Resource Controller |
|--------|---------------------|
| publish a photo | `PhotoPublicationController` |
| archive a post | `PostArchiveController` |
| invite team member | `TeamInvitationController` |
| approve request | `RequestApprovalController` |

```php
// Instead of custom actions on PhotoController:
// POST /photos/{photo}/publish  ❌

// Create a new resource controller:
// POST /photos/{photo}/publication  ✓
Route::post('photos/{photo}/publication', [PhotoPublicationController::class, 'store']);
Route::delete('photos/{photo}/publication', [PhotoPublicationController::class, 'destroy']);
```

**Route resources:**
```php
// routes/web.php
Route::resource('photos', PhotoController::class);
Route::resource('teams', TeamController::class);
Route::resource('teams.members', TeamMemberController::class)->shallow();
```
</rest_mapping>

<thin_controllers>
## Thin Controllers, Fat Models

Controllers delegate to Actions or Models. No business logic in controllers.

```php
// ❌ Fat controller - business logic in controller
class TeamController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $this->authorize('create', Team::class);

        $team = $request->user()->ownedTeams()->create([
            'name' => $validated['name'],
            'personal_team' => false,
        ]);

        $request->user()->switchTeam($team);

        event(new TeamCreated($team));

        return redirect()->route('teams.show', $team);
    }
}

// ✓ Thin controller - delegates to Action
class TeamController extends Controller
{
    public function store(Request $request, CreateTeam $action)
    {
        $team = $action->handle($request->user(), $request->all());

        return redirect()->route('teams.show', $team);
    }
}
```

**Controllers should only:**
- Receive HTTP requests
- Delegate to Actions or Models
- Return responses (redirects, views, JSON)
</thin_controllers>

<actions_pattern>
## The Actions Pattern

Actions are single-responsibility classes for business logic. Used extensively in Jetstream and Fortify.

**Directory structure:**
```
app/
├── Actions/
│   ├── Fortify/
│   │   ├── CreateNewUser.php
│   │   ├── ResetUserPassword.php
│   │   └── UpdateUserPassword.php
│   └── Team/
│       ├── CreateTeam.php
│       ├── DeleteTeam.php
│       ├── InviteTeamMember.php
│       └── RemoveTeamMember.php
```

**Action naming:**
| Pattern | Example |
|---------|---------|
| `{Verb}{Noun}` | `CreateTeam`, `DeleteUser` |
| `{Verb}{Noun}{Noun}` | `AddTeamMember`, `SendWelcomeEmail` |
| `{Verb}{Noun}With{Context}` | `DeleteUserWithTeams` |

**Action structure (Jetstream pattern):**
```php
<?php

namespace App\Actions\Team;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class CreateTeam
{
    public function handle(User $user, array $input): Team
    {
        // 1. Authorization
        Gate::forUser($user)->authorize('create', Team::class);

        // 2. Validation
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
        ])->validateWithBag('createTeam');

        // 3. Create and return
        $team = $user->ownedTeams()->create([
            'name' => $input['name'],
            'personal_team' => false,
        ]);

        // 4. Side effects
        $user->switchTeam($team);

        return $team;
    }
}
```

**Using Actions:**
```php
// Dependency injection (preferred)
public function store(Request $request, CreateTeam $action)
{
    $team = $action->handle($request->user(), $request->all());
    return redirect()->route('teams.show', $team);
}

// Or instantiate directly
$team = (new CreateTeam)->handle($user, $data);

// Or with app()
$team = app(CreateTeam::class)->handle($user, $data);
```

**Actions with Contracts (Jetstream pattern):**
```php
// Contract
interface CreatesTeams
{
    public function create(User $user, array $input): Team;
}

// Implementation
class CreateTeam implements CreatesTeams
{
    public function create(User $user, array $input): Team
    {
        // ...
    }
}

// Service provider registration
Jetstream::createTeamsUsing(CreateTeam::class);
```
</actions_pattern>

<form_requests>
## Form Requests

Use Form Requests for validation in controllers, but Actions can also validate internally.

```php
// app/Http/Requests/StoreTeamRequest.php
class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Team::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}

// Controller
public function store(StoreTeamRequest $request, CreateTeam $action)
{
    $team = $action->handle($request->user(), $request->validated());
    return redirect()->route('teams.show', $team);
}
```

**Validation in Actions (alternative):**
```php
class CreateTeam
{
    public function handle(User $user, array $input): Team
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
        ])->validate();

        // ...
    }
}
```

Choose based on reusability needs - Form Requests for HTTP-only, Action validation for reusable logic.
</form_requests>

<api_patterns>
## API Design

Same controllers, different format. Use `respond_to` pattern or dedicated API controllers.

```php
// Single controller handling both
class TeamController extends Controller
{
    public function store(Request $request, CreateTeam $action)
    {
        $team = $action->handle($request->user(), $request->validated());

        if ($request->wantsJson()) {
            return response()->json($team, 201);
        }

        return redirect()->route('teams.show', $team);
    }
}

// Or use API Resources
use App\Http\Resources\TeamResource;

public function show(Team $team)
{
    return new TeamResource($team);
}
```

**API Resources follow naming conventions:**
```
app/Http/Resources/TeamResource.php      → Team model
app/Http/Resources/UserResource.php      → User model
app/Http/Resources/TeamMemberResource.php → TeamMember or pivot
```

**Status codes:**
- Create: `201 Created`
- Update: `200 OK` or `204 No Content`
- Delete: `204 No Content`
- Validation error: `422 Unprocessable Entity`
</api_patterns>

<middleware>
## Middleware Patterns

Use middleware for cross-cutting concerns, not business logic.

```php
// Route middleware
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('teams', TeamController::class);
});

// Controller middleware
class TeamController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('verified')->except(['index', 'show']);
    }
}
```

**Common middleware:**
- `auth` - Authentication required
- `verified` - Email verified
- `password.confirm` - Confirm password for sensitive actions
- `throttle:api` - Rate limiting
</middleware>

<authorization>
## Authorization Patterns

Use Policies for resource authorization, Gates for simple checks.

```php
// Policy
class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team);
    }

    public function update(User $user, Team $team): bool
    {
        return $user->ownsTeam($team);
    }

    public function delete(User $user, Team $team): bool
    {
        return $user->ownsTeam($team);
    }
}

// In controller
public function update(Request $request, Team $team)
{
    $this->authorize('update', $team);
    // ...
}

// Or in Form Request
public function authorize(): bool
{
    return $this->user()->can('update', $this->route('team'));
}
```

**Gate for simple checks:**
```php
// In AuthServiceProvider
Gate::define('access-admin', function (User $user) {
    return $user->isAdmin();
});

// Usage
if (Gate::allows('access-admin')) {
    // ...
}
```
</authorization>

<response_patterns>
## Response Patterns

**Redirects with flash:**
```php
return redirect()
    ->route('teams.show', $team)
    ->with('success', 'Team created successfully.');
```

**Back with errors:**
```php
return back()->withErrors([
    'email' => 'This email is already taken.',
])->withInput();
```

**JSON responses:**
```php
// Success
return response()->json($data, 200);
return response()->json($data, 201); // Created

// No content
return response()->noContent(); // 204

// Error
return response()->json(['message' => 'Not found'], 404);
```

**Download responses:**
```php
return response()->download($path, $filename);
return response()->streamDownload(function () {
    echo $content;
}, $filename);
```
</response_patterns>
