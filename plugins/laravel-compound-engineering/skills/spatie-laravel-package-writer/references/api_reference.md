# Spatie Package Patterns Reference

Detailed patterns and templates for creating Laravel packages in the Spatie style.

## Table of Contents

1. [composer.json Template](#composerjson-template)
2. [TestCase Setup](#testcase-setup)
3. [Install Command Pattern](#install-command-pattern)
4. [Model Patterns](#model-patterns)
5. [Trait Patterns](#trait-patterns)
6. [Exception Patterns](#exception-patterns)

## composer.json Template

```json
{
    "name": "vendor/package-name",
    "description": "A brief description of your package",
    "keywords": ["laravel", "package-name"],
    "homepage": "https://github.com/vendor/package-name",
    "license": "MIT",
    "authors": [
        {
            "name": "Your Name",
            "email": "your@email.com"
        }
    ],
    "require": {
        "php": "^8.2",
        "illuminate/contracts": "^10.0|^11.0",
        "spatie/laravel-package-tools": "^1.16"
    },
    "require-dev": {
        "larastan/larastan": "^2.9",
        "orchestra/testbench": "^8.0|^9.0",
        "pestphp/pest": "^2.34",
        "pestphp/pest-plugin-laravel": "^2.3"
    },
    "autoload": {
        "psr-4": {
            "Vendor\\PackageName\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Vendor\\PackageName\\Tests\\": "tests/"
        }
    },
    "scripts": {
        "test": "vendor/bin/pest",
        "test-coverage": "vendor/bin/pest --coverage",
        "analyse": "vendor/bin/phpstan analyse"
    },
    "config": {
        "sort-packages": true,
        "allow-plugins": {
            "pestphp/pest-plugin": true
        }
    },
    "extra": {
        "laravel": {
            "providers": [
                "Vendor\\PackageName\\PackageNameServiceProvider"
            ],
            "aliases": {
                "PackageName": "Vendor\\PackageName\\Facades\\PackageName"
            }
        }
    },
    "minimum-stability": "dev",
    "prefer-stable": true
}
```

## TestCase Setup

```php
<?php

namespace Vendor\PackageName\Tests;

use Illuminate\Database\Eloquent\Factories\Factory;
use Orchestra\Testbench\TestCase as Orchestra;
use Vendor\PackageName\PackageNameServiceProvider;

class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Vendor\\PackageName\\Database\\Factories\\'.class_basename($modelName).'Factory'
        );
    }

    protected function getPackageProviders($app): array
    {
        return [
            PackageNameServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app): void
    {
        config()->set('database.default', 'testing');

        $migration = include __DIR__.'/../database/migrations/create_package_table.php';
        $migration->up();
    }
}
```

## Install Command Pattern

```php
<?php

namespace Vendor\PackageName\Commands;

use Illuminate\Console\Command;

class InstallCommand extends Command
{
    protected $signature = 'package-name:install';

    protected $description = 'Install the PackageName package';

    public function handle(): int
    {
        $this->info('Installing PackageName...');

        $this->info('Publishing configuration...');

        if (! $this->configExists('package-name.php')) {
            $this->publishConfiguration();
            $this->info('Published configuration');
        } else {
            if ($this->shouldOverwriteConfig()) {
                $this->info('Overwriting configuration file...');
                $this->publishConfiguration(forcePublish: true);
            } else {
                $this->info('Existing configuration was not overwritten');
            }
        }

        $this->info('Installed PackageName');

        return self::SUCCESS;
    }

    protected function configExists(string $fileName): bool
    {
        return file_exists(config_path($fileName));
    }

    protected function shouldOverwriteConfig(): bool
    {
        return $this->confirm(
            'Config file already exists. Do you want to overwrite it?',
            false
        );
    }

    protected function publishConfiguration(bool $forcePublish = false): void
    {
        $params = [
            '--provider' => "Vendor\PackageName\PackageNameServiceProvider",
            '--tag' => 'package-name-config',
        ];

        if ($forcePublish) {
            $params['--force'] = true;
        }

        $this->call('vendor:publish', $params);
    }
}
```

## Model Patterns

```php
<?php

namespace Vendor\PackageName\Models;

use Illuminate\Database\Eloquent\Model;
use Vendor\PackageName\Contracts\PackageModel;

class ExampleModel extends Model implements PackageModel
{
    protected $guarded = [];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->setTable(config('package-name.table_names.examples'));
    }

    public static function create(array $attributes = []): static
    {
        $model = static::query()->create($attributes);

        $model->fresh();

        return $model;
    }
}
```

## Trait Patterns

```php
<?php

namespace Vendor\PackageName\Traits;

use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Vendor\PackageName\RegistrarService;

trait HasFeature
{
    public static function bootHasFeature(): void
    {
        static::deleting(function ($model) {
            if (method_exists($model, 'isForceDeleting') && ! $model->isForceDeleting()) {
                return;
            }

            $model->features()->detach();
        });
    }

    public function features(): MorphToMany
    {
        return $this->morphToMany(
            config('package-name.models.feature'),
            'model',
            config('package-name.table_names.model_has_features'),
            config('package-name.column_names.model_morph_key'),
            'feature_id'
        );
    }

    public function assignFeature(...$features): static
    {
        $features = collect($features)
            ->flatten()
            ->map(fn ($feature) => $this->getStoredFeature($feature))
            ->all();

        $this->features()->saveMany($features);

        $this->forgetCachedFeatures();

        return $this;
    }

    protected function getStoredFeature($feature): mixed
    {
        return app(RegistrarService::class)->getFeatureClass()::findByName($feature);
    }

    protected function forgetCachedFeatures(): void
    {
        // Clear any cached feature data
    }
}
```

## Exception Patterns

```php
<?php

namespace Vendor\PackageName\Exceptions;

use InvalidArgumentException;

class FeatureDoesNotExist extends InvalidArgumentException
{
    public static function named(string $featureName): static
    {
        return new static("There is no feature named `{$featureName}`.");
    }

    public static function withId(int $featureId): static
    {
        return new static("There is no feature with id `{$featureId}`.");
    }
}
```

## phpstan.neon.dist Template

```neon
includes:
    - vendor/larastan/larastan/extension.neon

parameters:
    paths:
        - src
    level: 5
    ignoreErrors: []
    checkMissingIterableValueType: false
```

## .editorconfig Template

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 4
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2
```

## .gitattributes Template

```
* text=auto eol=lf

*.blade.php diff=html
*.css diff=css
*.html diff=html
*.md diff=markdown
*.php diff=php

/.github export-ignore
/art export-ignore
/docs export-ignore
/tests export-ignore
.editorconfig export-ignore
.gitattributes export-ignore
.gitignore export-ignore
CHANGELOG.md export-ignore
phpstan.neon.dist export-ignore
phpunit.xml.dist export-ignore
```
