# Testing - Taylor Otwell Style

## Core Philosophy

Taylor prefers **high-level feature tests** over unit tests:
> "The maintenance burden of tests that are a bit too low level is really pretty high. I get way more leverage on the higher level ones."

He writes tests **after implementation** rather than strict TDD, combining seeded data for happy paths with factories for edge cases.

## Why PEST Over PHPUnit

PEST is Taylor's preferred test framework for Laravel:
> "If Pest is going to be the default test runner... if you ran `php artisan make:test`, it would make a pest test."

**PEST advantages:**
- Cleaner, more expressive syntax
- Less boilerplate
- Better error messages
- Built-in expectations API
- Laravel-first design

## Factories for Test Data

Taylor prefers factories over fixtures (opposite of DHH):
> "Laravel model factories and seeders make it painless to create test database records."

```php
// database/factories/UserFactory.php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'is_admin' => true,
        ]);
    }
}

// Usage in tests
$user = User::factory()->create();
$admin = User::factory()->admin()->create();
$users = User::factory()->count(3)->create();
```

**Factory relationships:**
```php
// With relationships
$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();

// Shorthand
$user = User::factory()
    ->hasPosts(3)
    ->create();

// Belongs to
$posts = Post::factory()
    ->count(3)
    ->for(User::factory()->state(['name' => 'John']))
    ->create();
```

## Feature Test Structure

```php
// tests/Feature/TeamTest.php
<?php

use App\Models\Team;
use App\Models\User;

it('can create a team', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/teams', [
            'name' => 'New Team',
        ]);

    $response->assertRedirect();
    expect(Team::where('name', 'New Team')->exists())->toBeTrue();
    expect($user->fresh()->ownedTeams)->toHaveCount(1);
});

it('requires a name to create a team', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/teams', [
            'name' => '',
        ]);

    $response->assertSessionHasErrors(['name']);
});

it('requires authentication to create a team', function () {
    $response = $this->post('/teams', [
        'name' => 'New Team',
    ]);

    $response->assertRedirect('/login');
});
```

## PEST Syntax Patterns

**Basic test:**
```php
it('has a welcome page', function () {
    $this->get('/')->assertStatus(200);
});

test('the welcome page loads', function () {
    $this->get('/')->assertStatus(200);
});
```

**Expectations API:**
```php
expect($user->name)->toBe('John');
expect($user->email)->toContain('@');
expect($users)->toHaveCount(3);
expect($user->isAdmin())->toBeTrue();
expect($user->posts)->not->toBeEmpty();

// Chained expectations
expect($user)
    ->name->toBe('John')
    ->email->toEndWith('@example.com')
    ->isAdmin()->toBeFalse();
```

**Groups and datasets:**
```php
// Grouped tests
describe('team management', function () {
    it('can create a team', function () { ... });
    it('can update a team', function () { ... });
    it('can delete a team', function () { ... });
});

// Datasets
it('validates required fields', function (string $field) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/teams', [$field => ''])
        ->assertSessionHasErrors([$field]);
})->with(['name', 'description']);

// Multiple datasets
it('calculates prices correctly', function (int $quantity, int $price, int $expected) {
    expect(calculateTotal($quantity, $price))->toBe($expected);
})->with([
    [1, 100, 100],
    [2, 100, 200],
    [5, 50, 250],
]);
```

**Hooks:**
```php
beforeEach(function () {
    $this->user = User::factory()->create();
});

afterEach(function () {
    // Cleanup
});

beforeAll(function () {
    // Runs once before all tests in file
});
```

## Testing Authentication

```php
it('shows dashboard to authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertStatus(200)
        ->assertSee('Dashboard');
});

it('redirects guests to login', function () {
    $this->get('/dashboard')
        ->assertRedirect('/login');
});

it('can login with valid credentials', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
});
```

## Testing Actions

```php
use App\Actions\Team\CreateTeam;

it('creates a team with valid data', function () {
    $user = User::factory()->create();
    $action = new CreateTeam();

    $team = $action->handle($user, ['name' => 'New Team']);

    expect($team)
        ->name->toBe('New Team')
        ->owner_id->toBe($user->id);
});

it('validates team name', function () {
    $user = User::factory()->create();
    $action = new CreateTeam();

    expect(fn () => $action->handle($user, ['name' => '']))
        ->toThrow(ValidationException::class);
});
```

## Testing Livewire Components

```php
use Livewire\Livewire;
use App\Livewire\CreateTeam;

it('can create a team via livewire', function () {
    $user = User::factory()->create();

    Livewire::actingAs($user)
        ->test(CreateTeam::class)
        ->set('name', 'New Team')
        ->call('save')
        ->assertRedirect(route('teams.show', Team::first()));

    expect(Team::where('name', 'New Team')->exists())->toBeTrue();
});

it('validates name in real time', function () {
    $user = User::factory()->create();

    Livewire::actingAs($user)
        ->test(CreateTeam::class)
        ->set('name', '')
        ->assertHasErrors(['name' => 'required']);
});

it('emits event on team creation', function () {
    $user = User::factory()->create();

    Livewire::actingAs($user)
        ->test(CreateTeam::class)
        ->set('name', 'New Team')
        ->call('save')
        ->assertDispatched('team-created');
});
```

## Database Testing

**Refresh database:**
```php
// tests/Pest.php
uses(RefreshDatabase::class)->in('Feature');

// Or per-test
it('creates a user', function () {
    // Database is fresh
})->uses(RefreshDatabase::class);
```

**Database assertions:**
```php
it('stores user in database', function () {
    $this->post('/users', [
        'name' => 'John',
        'email' => 'john@example.com',
    ]);

    $this->assertDatabaseHas('users', [
        'name' => 'John',
        'email' => 'john@example.com',
    ]);
});

it('deletes user from database', function () {
    $user = User::factory()->create();

    $this->delete("/users/{$user->id}");

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
    // Or for soft deletes
    $this->assertSoftDeleted('users', ['id' => $user->id]);
});

it('has correct count', function () {
    User::factory()->count(5)->create();

    $this->assertDatabaseCount('users', 5);
});
```

## Testing Jobs and Queues

```php
use Illuminate\Support\Facades\Queue;

it('dispatches job on team creation', function () {
    Queue::fake();
    $user = User::factory()->create();

    $this->actingAs($user)->post('/teams', ['name' => 'New Team']);

    Queue::assertPushed(ProcessTeamCreation::class);
});

it('dispatches job with correct data', function () {
    Queue::fake();
    $user = User::factory()->create();

    $this->actingAs($user)->post('/teams', ['name' => 'New Team']);

    Queue::assertPushed(ProcessTeamCreation::class, function ($job) {
        return $job->team->name === 'New Team';
    });
});
```

## Testing Mail and Notifications

```php
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

it('sends welcome email on registration', function () {
    Mail::fake();

    $this->post('/register', [
        'name' => 'John',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    Mail::assertSent(WelcomeEmail::class, function ($mail) {
        return $mail->hasTo('john@example.com');
    });
});

it('notifies team owner on new member', function () {
    Notification::fake();
    $owner = User::factory()->create();
    $team = Team::factory()->for($owner, 'owner')->create();

    $team->members()->attach(User::factory()->create());

    Notification::assertSentTo($owner, NewTeamMemberNotification::class);
});
```

## Testing Events

```php
use Illuminate\Support\Facades\Event;

it('dispatches event on team creation', function () {
    Event::fake();
    $user = User::factory()->create();

    $this->actingAs($user)->post('/teams', ['name' => 'New Team']);

    Event::assertDispatched(TeamCreated::class);
});

it('dispatches event with team', function () {
    Event::fake();
    $user = User::factory()->create();

    $this->actingAs($user)->post('/teams', ['name' => 'New Team']);

    Event::assertDispatched(TeamCreated::class, function ($event) {
        return $event->team->name === 'New Team';
    });
});
```

## Mocking

```php
use App\Services\PaymentGateway;

it('processes payment', function () {
    $mock = $this->mock(PaymentGateway::class);
    $mock->shouldReceive('charge')
        ->once()
        ->with(1000, 'tok_visa')
        ->andReturn(true);

    $this->post('/checkout', ['token' => 'tok_visa', 'amount' => 1000])
        ->assertStatus(200);
});

// Partial mock
it('uses real methods except specified', function () {
    $mock = $this->partialMock(Service::class);
    $mock->shouldReceive('externalCall')->andReturn('mocked');

    // Other methods work normally
});
```

## Testing Time

```php
use Illuminate\Support\Carbon;

it('expires after 24 hours', function () {
    $token = Token::factory()->create();

    Carbon::setTestNow(now()->addHours(25));

    expect($token->isExpired())->toBeTrue();
});

it('is valid within 24 hours', function () {
    $this->freezeTime();
    $token = Token::factory()->create();

    $this->travel(23)->hours();

    expect($token->isExpired())->toBeFalse();
});
```

## File Organization

```
tests/
├── Feature/
│   ├── Auth/
│   │   ├── LoginTest.php
│   │   └── RegistrationTest.php
│   ├── Team/
│   │   ├── CreateTeamTest.php
│   │   └── DeleteTeamTest.php
│   └── Api/
│       └── TeamApiTest.php
├── Unit/
│   ├── Actions/
│   │   └── CreateTeamTest.php
│   └── Models/
│       └── UserTest.php
├── Pest.php              # Global configuration
└── TestCase.php          # Base test case
```

## Pest.php Configuration

```php
// tests/Pest.php
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class)->in('Feature', 'Unit');
uses(RefreshDatabase::class)->in('Feature');

// Global helpers
function actingAsUser(): TestCase
{
    return test()->actingAs(User::factory()->create());
}

// Expectations
expect()->extend('toBeValidEmail', function () {
    return $this->toMatch('/^.+@.+$/');
});
```

## Testing Principles

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Feature tests get more leverage** - Test complete workflows
3. **Use factories for flexibility** - Dynamic data for edge cases
4. **Keep tests readable** - Tests are documentation
5. **Tests ship with features** - Same commit, not before or after
