# Frontend - Taylor Otwell Style

<livewire_philosophy>
## Livewire Philosophy

Livewire enables dynamic interfaces without leaving PHP. Write reactive components in PHP, get JavaScript interactivity for free.

**When to use Livewire:**
- Forms with real-time validation
- Search with live results
- Data tables with sorting/filtering
- Modals and dialogs
- Any dynamic UI that would traditionally require JavaScript

**Livewire strengths:**
- Server-rendered (great for SEO)
- Full access to Laravel's ecosystem
- No API layer needed
- Feels like writing Blade templates
</livewire_philosophy>

<component_structure>
## Livewire Component Structure

```php
// app/Livewire/CreateTeam.php
<?php

namespace App\Livewire;

use App\Actions\Team\CreateTeam as CreateTeamAction;
use Livewire\Component;

class CreateTeam extends Component
{
    public string $name = '';

    protected $rules = [
        'name' => ['required', 'string', 'max:255'],
    ];

    public function save(CreateTeamAction $action): void
    {
        $this->validate();

        $team = $action->handle(auth()->user(), [
            'name' => $this->name,
        ]);

        $this->redirect(route('teams.show', $team));
    }

    public function render()
    {
        return view('livewire.create-team');
    }
}
```

```blade
{{-- resources/views/livewire/create-team.blade.php --}}
<form wire:submit="save">
    <div>
        <label for="name">Team Name</label>
        <input wire:model="name" type="text" id="name">
        @error('name') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit">Create Team</button>
</form>
```

**Component naming:**
- `CreateTeam`, `EditUser`, `UserProfile` - PascalCase
- Verb + Noun for action-oriented components
- Noun for display-oriented components
</component_structure>

<livewire_patterns>
## Common Livewire Patterns

**Real-time validation:**
```php
class CreateUser extends Component
{
    public string $email = '';
    public string $name = '';

    protected $rules = [
        'email' => ['required', 'email', 'unique:users'],
        'name' => ['required', 'string', 'max:255'],
    ];

    public function updated($propertyName): void
    {
        $this->validateOnly($propertyName);
    }

    public function save(): void
    {
        $this->validate();
        // ...
    }
}
```

```blade
<input wire:model.blur="email" type="email">
@error('email') <span>{{ $message }}</span> @enderror
```

**Search with debounce:**
```php
class UserSearch extends Component
{
    public string $search = '';

    public function render()
    {
        return view('livewire.user-search', [
            'users' => User::where('name', 'like', "%{$this->search}%")
                ->limit(10)
                ->get(),
        ]);
    }
}
```

```blade
<input wire:model.live.debounce.300ms="search" type="text" placeholder="Search...">

<ul>
    @foreach($users as $user)
        <li>{{ $user->name }}</li>
    @endforeach
</ul>
```

**Modal pattern:**
```php
class DeleteTeamModal extends Component
{
    public bool $showModal = false;
    public ?Team $team = null;

    public function confirmDelete(Team $team): void
    {
        $this->team = $team;
        $this->showModal = true;
    }

    public function delete(): void
    {
        $this->team->delete();
        $this->showModal = false;
        $this->dispatch('team-deleted');
    }

    public function render()
    {
        return view('livewire.delete-team-modal');
    }
}
```

**Pagination:**
```php
use Livewire\WithPagination;

class UserList extends Component
{
    use WithPagination;

    public function render()
    {
        return view('livewire.user-list', [
            'users' => User::paginate(10),
        ]);
    }
}
```

**File uploads:**
```php
use Livewire\WithFileUploads;

class UploadPhoto extends Component
{
    use WithFileUploads;

    public $photo;

    protected $rules = [
        'photo' => ['required', 'image', 'max:1024'],
    ];

    public function save(): void
    {
        $this->validate();
        $path = $this->photo->store('photos');
        // ...
    }
}
```

```blade
<input wire:model="photo" type="file">
@error('photo') <span>{{ $message }}</span> @enderror

@if ($photo)
    <img src="{{ $photo->temporaryUrl() }}">
@endif
```
</livewire_patterns>

<livewire_actions>
## Livewire with Actions Pattern

Livewire components delegate to Actions - keep components thin.

```php
class CreateTeam extends Component
{
    public string $name = '';

    protected $rules = [
        'name' => ['required', 'string', 'max:255'],
    ];

    // Minimal Livewire action that delegates to invocable Action
    public function save(CreateTeamAction $action): void
    {
        $this->validate();

        $team = $action->handle(auth()->user(), [
            'name' => $this->name,
        ]);

        $this->redirect(route('teams.show', $team));
    }

    public function render()
    {
        return view('livewire.create-team');
    }
}
```

**Benefits:**
- Actions are reusable (API, CLI, tests)
- Livewire component stays focused on UI concerns
- Business logic is testable independently
</livewire_actions>

<alpine_integration>
## Alpine.js Integration

Livewire pairs naturally with Alpine.js for client-side interactivity.

**Dropdown:**
```blade
<div x-data="{ open: false }">
    <button @click="open = !open">Menu</button>

    <div x-show="open" @click.away="open = false">
        <a href="#">Profile</a>
        <a href="#">Settings</a>
        <button wire:click="logout">Logout</button>
    </div>
</div>
```

**Tabs:**
```blade
<div x-data="{ tab: 'profile' }">
    <button @click="tab = 'profile'" :class="{ 'active': tab === 'profile' }">
        Profile
    </button>
    <button @click="tab = 'settings'" :class="{ 'active': tab === 'settings' }">
        Settings
    </button>

    <div x-show="tab === 'profile'">
        @livewire('user-profile')
    </div>
    <div x-show="tab === 'settings'">
        @livewire('user-settings')
    </div>
</div>
```

**Confirm dialog:**
```blade
<button
    x-data
    x-on:click="if (confirm('Are you sure?')) $wire.delete()"
>
    Delete
</button>
```

**Entangle (sync Alpine and Livewire state):**
```blade
<div x-data="{ open: $wire.entangle('showModal') }">
    <button @click="open = true">Open Modal</button>

    <div x-show="open" x-transition>
        <!-- Modal content -->
        <button @click="open = false">Close</button>
    </div>
</div>
```
</alpine_integration>

<blade_patterns>
## Blade Patterns

**Layouts:**
```blade
{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>{{ $title ?? config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body>
    <x-navigation />

    <main>
        {{ $slot }}
    </main>

    @livewireScripts
</body>
</html>
```

**Using layouts:**
```blade
<x-app-layout>
    <x-slot:title>Dashboard</x-slot:title>

    <h1>Welcome back!</h1>
</x-app-layout>
```

**Components:**
```blade
{{-- resources/views/components/button.blade.php --}}
@props([
    'type' => 'button',
    'variant' => 'primary',
])

<button
    type="{{ $type }}"
    {{ $attributes->class([
        'btn',
        'btn-primary' => $variant === 'primary',
        'btn-secondary' => $variant === 'secondary',
        'btn-danger' => $variant === 'danger',
    ]) }}
>
    {{ $slot }}
</button>
```

```blade
<x-button type="submit" variant="primary">Save</x-button>
<x-button variant="danger" wire:click="delete">Delete</x-button>
```

**Conditional classes:**
```blade
<div @class([
    'card',
    'card-featured' => $post->featured,
    'card-draft' => !$post->published,
])>
    {{ $post->title }}
</div>
```
</blade_patterns>

<tailwind_patterns>
## Tailwind CSS Patterns

Taylor embraces Tailwind CSS for styling.

**Form styling:**
```blade
<form wire:submit="save" class="space-y-6">
    <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
            Name
        </label>
        <input
            wire:model="name"
            type="text"
            id="name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
        @error('name')
            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
        @enderror
    </div>

    <button
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
        Save
    </button>
</form>
```

**Card component:**
```blade
<div class="overflow-hidden rounded-lg bg-white shadow">
    <div class="px-4 py-5 sm:p-6">
        {{ $slot }}
    </div>
</div>
```

**Responsive design:**
```blade
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    @foreach($items as $item)
        <x-card>{{ $item->name }}</x-card>
    @endforeach
</div>
```

**Dark mode:**
```blade
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    Content that adapts to dark mode
</div>
```
</tailwind_patterns>

<loading_states>
## Loading States

**Wire loading:**
```blade
<button wire:click="save" wire:loading.attr="disabled">
    <span wire:loading.remove>Save</span>
    <span wire:loading>Saving...</span>
</button>
```

**Target specific actions:**
```blade
<button wire:click="save">
    <span wire:loading.remove wire:target="save">Save</span>
    <span wire:loading wire:target="save">Saving...</span>
</button>

<button wire:click="delete">
    <span wire:loading.remove wire:target="delete">Delete</span>
    <span wire:loading wire:target="delete">Deleting...</span>
</button>
```

**Loading overlay:**
```blade
<div wire:loading.class="opacity-50 pointer-events-none">
    <!-- Content dims during loading -->
</div>
```
</loading_states>

<events>
## Component Communication

**Dispatching events:**
```php
// From Livewire
$this->dispatch('team-created', teamId: $team->id);

// With browser event
$this->dispatch('team-created')->to('team-list');
```

**Listening to events:**
```php
#[On('team-created')]
public function refreshList(): void
{
    // Refresh component
}

// Or in component definition
protected $listeners = ['team-created' => 'refreshList'];
```

**In Blade with Alpine:**
```blade
<div x-on:team-created.window="$wire.$refresh()">
    <!-- Refreshes when event fires -->
</div>
```
</events>

<polling>
## Polling and Real-time

**Simple polling:**
```blade
<div wire:poll.5s>
    Last updated: {{ now() }}
</div>
```

**Conditional polling:**
```blade
<div wire:poll.5s="checkStatus" wire:poll.keep-alive>
    Status: {{ $status }}
</div>
```

**With Laravel Echo (WebSockets):**
```php
class NotificationList extends Component
{
    public function getListeners()
    {
        return [
            "echo-private:users.{$this->userId},NotificationReceived" => 'addNotification',
        ];
    }

    public function addNotification($notification): void
    {
        // Handle real-time notification
    }
}
```
</polling>

<testing_livewire>
## Testing Livewire Components

```php
use Livewire\Livewire;

it('can create a team', function () {
    $user = User::factory()->create();

    Livewire::actingAs($user)
        ->test(CreateTeam::class)
        ->set('name', 'New Team')
        ->call('save')
        ->assertRedirect(route('teams.show', Team::first()));

    expect(Team::where('name', 'New Team')->exists())->toBeTrue();
});

it('validates team name is required', function () {
    $user = User::factory()->create();

    Livewire::actingAs($user)
        ->test(CreateTeam::class)
        ->set('name', '')
        ->call('save')
        ->assertHasErrors(['name' => 'required']);
});

it('shows real-time validation errors', function () {
    $user = User::factory()->create();

    Livewire::actingAs($user)
        ->test(CreateTeam::class)
        ->set('name', '')
        ->assertHasErrors(['name']);
});
```
</testing_livewire>
