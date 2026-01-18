---
name: spatie-laravel-package-writer
description: Write Laravel packages following Spatie's proven patterns and philosophy. Creates clean, readable, well-tested Laravel packages with excellent developer experience. MANDATORY TRIGGERS - Use when asked to create a Laravel package, write a Laravel library, design a package API, or when Spatie's style is mentioned. Keywords - Laravel package, composer package, service provider, facade, spatie style.
---

# Spatie Laravel Package Writer

Write Laravel packages following Spatie's philosophy: readable code, sensible defaults, excellent documentation, and packages that are "fun to use."

## Core Principle

> Follow Laravel conventions first. If Laravel has a documented way to do something, use it. Only deviate when you have a clear justification.

### Seven Package Principles

1. **Make it easy to use** - Packages should be fun to use
2. **Write excellent documentation** - Features must be discoverable
3. **Provide extensive test suites** - Prove the code works
4. **Write readable code** - Names chosen with care
5. **Be flexible** - Customizable and extensible
6. **Keep scope small** - One polished feature, not all edge cases
7. **Stay up to date** - Support new PHP/Laravel versions quickly

## PHP Standards

### Type Declarations
- Follow PSR-1, PSR-2, and PSR-12
- Use typed properties, not docblocks
- Use short nullable: `?string` not `string|null`
- Always specify `void` return types
- Constructor property promotion when all properties can be promoted

```php
// Good
public function __construct(
    protected string $name,
    protected ?int $age = null,
) {}

protected function process(): void
{
    // ...
}
```

### Docblocks
- Don't use docblocks for fully type-hinted methods (unless description needed)
- Always import classnames - never fully qualified names in docblocks
- Document iterables with generics: `/** @return Collection<int, User> */`
- Array shapes for fixed keys:
```php
/** @return array{first: string, second: int} */
```

### Control Flow

**Happy path last** - handle errors first, success case last (unindented):

```php
public function process($data)
{
    if (empty($data)) {
        throw new InvalidArgumentException('Data cannot be empty');
    }

    if (! $this->isValid($data)) {
        return null;
    }

    return $this->transform($data);
}
```

**Avoid else** - use early returns:

```php
// Bad
if ($condition) {
    return 'yes';
} else {
    return 'no';
}

// Good
if ($condition) {
    return 'yes';
}

return 'no';
```

**Ternaries** - each part on own line unless very short:

```php
// Short
$name = $isFoo ? 'foo' : 'bar';

// Multi-line
$result = $object instanceof Model
    ? $object->name
    : 'A default value';
```

### Strings & Comments
- String interpolation over concatenation: `"Hi, I am {$name}."`
- Avoid comments - write expressive code instead
- Always use curly brackets, even for single statements

## Package Structure

```
package-name/
├── src/
│   ├── Commands/
│   ├── Contracts/
│   ├── Events/
│   ├── Exceptions/
│   ├── Facades/
│   ├── Models/
│   ├── Traits/
│   └── {PackageName}ServiceProvider.php
├── config/
│   └── package-name.php
├── database/migrations/
├── resources/views/
├── tests/
│   ├── TestCase.php
│   └── Feature/
├── CHANGELOG.md
├── LICENSE.md
├── README.md
├── composer.json
└── phpstan.neon.dist
```

## Service Provider

Always use `spatie/laravel-package-tools`:

```php
<?php

namespace Vendor\PackageName;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class PackageNameServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('package-name')
            ->hasConfigFile()
            ->hasViews()
            ->hasMigration('create_package_tables')
            ->hasCommand(PackageCommand::class);
    }
}
```

## Class Design

### Protected Over Private
Default to `protected` for extensibility - no `final` keyword:

```php
protected function performAction(): void
{
    // Allows package users to extend
}
```

### Traits on Separate Lines
```php
class User extends Model
{
    use HasRoles;
    use HasPermissions;
    use Notifiable;
}
```

### Enums
Use PascalCase for values:
```php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
}
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Controllers | Plural + Controller | `UsersController` |
| Jobs | Action description | `CreateUser`, `PerformCleanup` |
| Events | Tense indicates timing | `UserRegistering` (before), `UserRegistered` (after) |
| Listeners | Action + Listener | `SendInvitationMailListener` |
| Commands | Action + Command | `PublishScheduledPostsCommand` |
| Mailables | Description + Mail | `AccountActivatedMail` |
| Config files | kebab-case | `package-name.php` |
| Config keys | snake_case | `table_names`, `cache_expiration` |
| Route names | camelCase | `openSource`, `userProfile` |
| URLs | kebab-case | `/open-source`, `/user-profile` |
| Artisan commands | kebab-case | `package:do-something` |
| Views | camelCase | `openSource.blade.php` |

## Routes

```php
// Tuple notation, verb first
Route::get('open-source', [OpenSourceController::class, 'index'])
    ->name('openSource');

// Parameters in camelCase
Route::get('users/{userId}', [UsersController::class, 'show']);
```

## Configuration

- Match package name (`package-name.php`)
- Use snake_case keys with extensive comments
- Provide sensible defaults, allow class overrides
- Use `config()` helper, avoid `env()` outside config files

```php
<?php

return [
    /*
     * The models used by the package.
     */
    'models' => [
        'permission' => Spatie\Permission\Models\Permission::class,
    ],

    /*
     * Cache settings. Set to null to disable.
     */
    'cache' => [
        'expiration_time' => \DateInterval::createFromDateString('24 hours'),
        'store' => 'default',
    ],
];
```

## Artisan Commands

Always provide feedback, show progress, output BEFORE processing:

```php
public function handle(): int
{
    $items = Item::all();

    $items->each(function (Item $item) {
        $this->info("Processing item id `{$item->id}`...");
        $this->processItem($item);
    });

    $this->comment("Processed {$items->count()} items.");

    return self::SUCCESS;
}
```

## Validation

Use array notation (easier for custom rules):

```php
public function rules(): array
{
    return [
        'email' => ['required', 'email'],
    ];
}
```

## Testing

Use Pest, follow arrange-act-assert:

```php
it('can assign a role to a user', function () {
    $user = User::factory()->create();

    $user->assignRole('admin');

    expect($user->hasRole('admin'))->toBeTrue();
});
```

## Migrations

Only write `up()` methods, not `down()`.

## Checklist Before Release

- [ ] All tests pass (`composer test`)
- [ ] PHPStan passes (`./vendor/bin/phpstan`)
- [ ] README has clear installation and usage
- [ ] Config file has extensive comments
- [ ] Service provider uses laravel-package-tools
- [ ] No `final` keywords
- [ ] Methods are `protected` not `private`
- [ ] Happy path last pattern followed
- [ ] Type hints on all properties and methods

## Detailed Templates

For full code templates (composer.json, TestCase, Models, Traits, Exceptions), see [references/api_reference.md](references/api_reference.md).

## External Resources

- Package skeleton: `composer create-project spatie/package-skeleton-laravel`
- Guidelines: spatie.be/guidelines/laravel-php
- AI Guidelines: spatie.be/guidelines/ai
- Package tools: github.com/spatie/laravel-package-tools
