<?php

namespace Tests\Feature\Website;

use App\Enums\WebsitePermission;
use App\Enums\WebsiteStatus;
use App\Models\Database;
use App\Models\Role;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Modules\Auth\Models\User;
use Tests\TestCase;

class WebsiteApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('permission:generate');

        Passport::actingAs($this->adminUser());
    }

    protected function adminUser(): User
    {
        $role = Role::findOrCreate('admin', 'api');
        $role->syncPermissions(WebsitePermission::values());

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    protected function makeWebsite(array $attributes = []): Website
    {
        return Website::create(array_merge([
            'title' => 'Site '.uniqid(),
            'subdomain' => 'site-'.uniqid(),
            'status' => WebsiteStatus::ACTIVE,
            'user_id' => User::factory()->create()->id,
        ], $attributes));
    }

    public function test_index_requires_authentication(): void
    {
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/admin/websites')->assertUnauthorized();
    }

    public function test_index_forbids_user_without_permission(): void
    {
        Passport::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/websites')->assertForbidden();
    }

    public function test_index_lists_websites(): void
    {
        $website = $this->makeWebsite(['title' => 'Alpha Site']);

        $this->getJson('/api/v1/admin/websites')
            ->assertOk()
            ->assertJsonPath('data.0.id', $website->id)
            ->assertJsonPath('data.0.title', 'Alpha Site')
            ->assertJsonStructure(['data' => [['id', 'title', 'subdomain', 'status', 'status_label', 'url']]]);
    }

    public function test_index_filters_by_search_and_status(): void
    {
        $this->makeWebsite(['title' => 'Alpha', 'status' => WebsiteStatus::ACTIVE]);
        $this->makeWebsite(['title' => 'Beta', 'status' => WebsiteStatus::SUSPENDED]);

        $this->getJson('/api/v1/admin/websites?q=Alpha')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/websites?status=suspended')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Beta');
    }

    public function test_store_creates_website(): void
    {
        $owner = User::factory()->create();

        $response = $this->postJson('/api/v1/admin/websites', [
            'title' => 'New Site',
            'subdomain' => 'new-site',
            'domain' => 'new-site.com',
            'status' => WebsiteStatus::ACTIVE->value,
            'user_id' => $owner->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'New Site')
            ->assertJsonPath('data.subdomain', 'new-site')
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.owner.id', $owner->id);

        $this->assertDatabaseHas('websites', ['subdomain' => 'new-site', 'domain' => 'new-site.com']);
    }

    public function test_store_validates_input(): void
    {
        $this->makeWebsite(['subdomain' => 'taken']);

        $this->postJson('/api/v1/admin/websites', [
            'title' => '',
            'subdomain' => 'taken',
            'status' => 'invalid',
            'user_id' => 'not-a-uuid',
        ])->assertJsonValidationErrors(['title', 'subdomain', 'status', 'user_id']);
    }

    public function test_store_validates_database_exists(): void
    {
        $this->postJson('/api/v1/admin/websites', [
            'title' => 'New Site',
            'subdomain' => 'new-site',
            'status' => WebsiteStatus::ACTIVE->value,
            'user_id' => User::factory()->create()->id,
            'database' => 'missing-db',
        ])->assertJsonValidationErrors('database');
    }

    public function test_show_returns_website(): void
    {
        $website = $this->makeWebsite();

        $this->getJson("/api/v1/admin/websites/{$website->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $website->id);
    }

    public function test_show_returns_not_found(): void
    {
        $this->getJson('/api/v1/admin/websites/00000000-0000-4000-8000-000000000000')
            ->assertNotFound();
    }

    public function test_update_updates_website(): void
    {
        $website = $this->makeWebsite(['title' => 'Old']);

        $this->putJson("/api/v1/admin/websites/{$website->id}", [
            'title' => 'Updated',
            'subdomain' => $website->subdomain,
            'status' => WebsiteStatus::SUSPENDED->value,
            'user_id' => $website->user_id,
            'is_demo' => true,
        ])->assertOk()
            ->assertJsonPath('data.title', 'Updated')
            ->assertJsonPath('data.status', 'suspended')
            ->assertJsonPath('data.is_demo', true);

        $this->assertDatabaseHas('websites', [
            'id' => $website->id,
            'title' => 'Updated',
            'status' => 'suspended',
        ]);
    }

    public function test_database_counter_is_synced(): void
    {
        $dbA = Database::create(['name' => 'db_a', 'total_websites' => 0]);
        $dbB = Database::create(['name' => 'db_b', 'total_websites' => 0]);
        $owner = User::factory()->create();

        $response = $this->postJson('/api/v1/admin/websites', [
            'title' => 'DB Site',
            'subdomain' => 'db-site',
            'status' => WebsiteStatus::ACTIVE->value,
            'user_id' => $owner->id,
            'database' => 'db_a',
        ])->assertCreated();

        $this->assertSame(1, $dbA->fresh()->total_websites);

        $websiteId = $response->json('data.id');

        $this->putJson("/api/v1/admin/websites/{$websiteId}", [
            'title' => 'DB Site',
            'subdomain' => 'db-site',
            'status' => WebsiteStatus::ACTIVE->value,
            'user_id' => $owner->id,
            'database' => 'db_b',
        ])->assertOk();

        $this->assertSame(0, $dbA->fresh()->total_websites);
        $this->assertSame(1, $dbB->fresh()->total_websites);

        $this->deleteJson("/api/v1/admin/websites/{$websiteId}")->assertOk();

        $this->assertSame(0, $dbB->fresh()->total_websites);
        $this->assertDatabaseMissing('websites', ['id' => $websiteId]);
    }
}
